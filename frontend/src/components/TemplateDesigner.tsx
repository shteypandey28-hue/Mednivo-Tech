import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Layout, Image as ImageIcon, CheckCircle, Loader2, Trash2, MousePointer2, SlidersHorizontal, PenTool, X, Edit2 } from "lucide-react";
import { PrescriptionPreview, AutoScaledPreview } from "./PrescriptionPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export function TemplateDesigner() {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingSig, setIsUploadingSig] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [templatesList, setTemplatesList] = useState<any[]>([]);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const handleAddCustomText = () => {
    if (!editingTemplate) return;
    const updated = { ...editingTemplate };
    if (!updated.margins) updated.margins = {};
    if (typeof updated.margins === 'string') {
      try {
        updated.margins = JSON.parse(updated.margins);
      } catch (e) {
        updated.margins = {};
      }
    }
    if (!updated.margins.customTexts) updated.margins.customTexts = [];
    
    updated.margins.customTexts.push({
      id: `custom_${Date.now()}`,
      html: '<p>Custom Text</p>',
      x: 50,
      y: 100,
      width: 495
    });
    setEditingTemplate(updated);
    setIsAdvancedMode(true);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/clinic/print-templates');
      setTemplatesList(data);
    } catch (e) {
      console.error(e);
    }
  };

  const detectMargins = (file: File): Promise<{top: number, bottom: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve({ top: 150, bottom: 50 });
        
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Adaptive Paper Color Detection (sample 4 corners)
        let cornerSamples = 0;
        let sumR = 0, sumG = 0, sumB = 0;
        const sampleArea = (startX: number, startY: number) => {
          for (let y = startY; y < startY + 10 && y < height; y++) {
            for (let x = startX; x < startX + 10 && x < width; x++) {
              const i = (y * width + x) * 4;
              sumR += data[i]; sumG += data[i+1]; sumB += data[i+2];
              cornerSamples++;
            }
          }
        };
        sampleArea(0, 0); // Top-left
        sampleArea(width - 10, 0); // Top-right
        sampleArea(0, height - 10); // Bottom-left
        sampleArea(width - 10, height - 10); // Bottom-right
        
        const paperR = sumR / cornerSamples;
        const paperG = sumG / cornerSamples;
        const paperB = sumB / cornerSamples;

        // A pixel is 'dark' (content) if it is significantly darker than the paper color
        const isDark = (r: number, g: number, b: number) => {
          return (paperR - r > 30) || (paperG - g > 30) || (paperB - b > 30);
        };

        let headerBottomY = 0;
        let footerTopY = height;

        // Scan top 45% for header
        const topBound = Math.floor(height * 0.45);
        for (let y = 0; y < topBound; y++) {
          let darkCount = 0;
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            if (isDark(data[i], data[i+1], data[i+2])) darkCount++;
          }
          if (darkCount > width * 0.01) headerBottomY = y;
        }

        // Scan bottom 30% for footer
        const bottomBound = Math.floor(height * 0.70);
        for (let y = height - 1; y > bottomBound; y--) {
          let darkCount = 0;
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            if (isDark(data[i], data[i+1], data[i+2])) darkCount++;
          }
          if (darkCount > width * 0.01) footerTopY = y;
        }

        let topMarginPts = (headerBottomY / height) * 841.89 + 30; // 30pt safety padding
        let bottomMarginPts = ((height - footerTopY) / height) * 841.89 + 30;
        
        if (topMarginPts < 50) topMarginPts = 50;
        if (bottomMarginPts < 50) bottomMarginPts = 50;
        // If it detected the entire page as header (due to shadows), fallback to 180
        if (topMarginPts > 400) topMarginPts = 180; 

        resolve({
          top: Math.round(topMarginPts),
          bottom: Math.round(bottomMarginPts)
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const detectedMargins = await detectMargins(file);

      // 1. Send to AI Vision Endpoint (upload)
      const res = await api.post('/ai/prescription-pad', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { fileUrl } = res.data;
      
      // 2. Save it as a new PrintTemplate in DB
      const saveRes = await api.post('/clinic/print-templates', {
        name: "My Custom Pad " + new Date().toLocaleDateString(),
        headerImageUrl: fileUrl,
        margins: { top: detectedMargins.top, bottom: detectedMargins.bottom, left: 50, right: 50 },
        isActive: true,
        isDefault: templatesList.length === 0
      });

      fetchTemplates();
      setEditingTemplate(saveRes.data);
    } catch (error) {
      console.error("Failed to process template", error);
      alert("Failed to analyze template.");
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTemplate) return;

    setIsUploadingSig(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post('/ai/prescription-pad', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { fileUrl } = res.data;
      
      const updatedTemplate = { ...editingTemplate, signatureUrl: fileUrl };
      await api.patch(`/clinic/print-templates/${editingTemplate.id}`, { signatureUrl: fileUrl });
      
      setEditingTemplate(updatedTemplate);
      fetchTemplates();
    } catch (error) {
      console.error("Failed to upload signature", error);
      alert("Failed to upload signature.");
    } finally {
      setIsUploadingSig(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // Create an endpoint for setting default, or just do a patch for this specific logic
      // Assuming a generic update logic for now
      // A more robust backend would ensure only one isDefault: true per doctor,
      // but for this UI we'll just optimistically update it and let the user handle it
      // Actually, we should add an endpoint `PATCH /clinic/print-templates/:id/default` or similar.
      // Let's just use the update endpoint, but the backend should ideally handle the uniqueness.
      await api.patch(`/clinic/print-templates/${id}`, { isDefault: true });
      fetchTemplates();
      alert('Template set as default!');
    } catch (e) {
      console.error(e);
      alert('Failed to set default.');
    }
  };

  const handleCreateDefaultTemplate = async () => {
    try {
      const saveRes = await api.post('/clinic/print-templates', {
        name: "Standard Minimalist Pad " + new Date().toLocaleDateString(),
        margins: { top: 100, bottom: 50, left: 50, right: 50 },
        isActive: true,
        isDefault: templatesList.length === 0
      });
      fetchTemplates();
      setEditingTemplate(saveRes.data);
    } catch (e) {
      console.error(e);
      alert('Failed to create default template.');
    }
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent triggering the div click
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/clinic/print-templates/${id}`);
      if (editingTemplate?.id === id) setEditingTemplate(null);
      fetchTemplates();
    } catch (e) {
      console.error(e);
      alert('Failed to delete template.');
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    try {
      await api.patch(`/clinic/print-templates/${editingTemplate.id}`, editingTemplate);
      fetchTemplates();
      alert('Template layout saved!');
      setEditingTemplate(null);
    } catch (e) {
      console.error(e);
      alert('Failed to update template.');
    }
  };

  return (
    <>
      <div className="flex flex-col bg-slate-50 rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-10">
        
        {/* Top Header */}
        <div className="p-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Prescription Templates</h2>
            <p className="text-sm text-slate-500 mt-1">
              Design your digital prescription pad. Upload your physical letterhead and arrange elements.
            </p>
          </div>
          <div className="flex gap-3">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all rounded-xl"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload Letterhead
            </Button>
            <Button variant="outline" className="rounded-xl border-slate-200" onClick={handleCreateDefaultTemplate}>
              <Layout className="w-4 h-4 mr-2 text-slate-500" />
              Blank Pad
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 bg-slate-50 min-h-[400px]">
          {templatesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400 py-20">
              <ImageIcon className="w-16 h-16 opacity-20 mb-4" />
              <p className="text-lg font-medium text-slate-600">No templates found</p>
              <p className="text-sm mt-1">Upload a letterhead or create a blank pad to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templatesList.map(t => (
                <div 
                  key={t.id} 
                  className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col ${t.isDefault ? 'border-emerald-300 ring-1 ring-emerald-300/50' : 'border-slate-200'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{t.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">Created: {new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                    {t.isDefault && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-h-[120px] bg-slate-50 border border-dashed border-slate-200 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                    {t.headerImageUrl ? (
                      <img src={`http://localhost:3000${t.headerImageUrl}`} className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <div className="text-slate-300 flex flex-col items-center">
                        <Layout className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium">Blank Pad Layout</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <Button 
                      onClick={() => setEditingTemplate(t)}
                      className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-10 font-semibold"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Layout
                    </Button>
                    {!t.isDefault && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSetDefault(t.id)}
                          className="flex-1 h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                        >
                          Make Default
                        </button>
                        <button 
                          onClick={(e) => handleDeleteTemplate(e, t.id)} 
                          className="w-10 h-10 flex-shrink-0 border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL FOR EDITING TEMPLATE */}
      {editingTemplate && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="bg-white w-full max-w-7xl h-full max-h-[900px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layout className="w-5 h-5 text-emerald-600" />
                Edit Template Layout
              </h2>
              <button 
                onClick={() => setEditingTemplate(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
              
              {/* Left Column: Settings */}
              <div className="w-full lg:w-96 bg-slate-50 border-r border-slate-100 flex flex-col flex-shrink-0 overflow-y-auto">
                <div className="p-6 space-y-8">
                  
                  {/* Template Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Template Name</label>
                    <Input 
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      className="bg-white border-slate-200 shadow-sm rounded-xl h-12"
                    />
                  </div>
                  
                  {/* Layout Mode Toggle */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Layout Engine</label>
                    <div className="flex bg-slate-200/50 p-1.5 rounded-xl">
                      <button
                        onClick={() => setIsAdvancedMode(false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${!isAdvancedMode ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        Standard
                      </button>
                      <button
                        onClick={() => setIsAdvancedMode(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${isAdvancedMode ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <MousePointer2 className="w-4 h-4" />
                        Drag & Drop
                      </button>
                    </div>
                  </div>

                  {/* Advanced Mode Tools */}
                  {isAdvancedMode ? (
                     <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col gap-3">
                        <div>
                          <p className="text-sm text-emerald-800 font-bold mb-1">Drag & Drop Active</p>
                          <p className="text-xs text-emerald-600/90 leading-relaxed">Click and drag elements directly on the canvas to position them perfectly.</p>
                        </div>
                     </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Header Gap</p>
                          <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                            {typeof editingTemplate.margins === 'object' ? Math.round(editingTemplate.margins.top) : 100} px
                          </span>
                        </div>
                        <input 
                          type="range" min="50" max="450" 
                          value={typeof editingTemplate.margins === 'object' ? editingTemplate.margins.top : 100}
                          onChange={(e) => setEditingTemplate({...editingTemplate, margins: {...editingTemplate.margins, top: parseInt(e.target.value)}})}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                      
                      <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Footer Gap</p>
                          <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                            {typeof editingTemplate.margins === 'object' ? Math.round(editingTemplate.margins.bottom) : 50} px
                          </span>
                        </div>
                        <input 
                          type="range" min="0" max="300" 
                          value={typeof editingTemplate.margins === 'object' ? editingTemplate.margins.bottom : 50}
                          onChange={(e) => setEditingTemplate({...editingTemplate, margins: {...editingTemplate.margins, bottom: parseInt(e.target.value)}})}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Universal Signature Upload */}
                  <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col gap-4">
                    
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Custom Text Block</p>
                      <Button 
                        onClick={handleAddCustomText}
                        className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 border-none rounded-xl h-10 font-semibold"
                      >
                        + Add Custom Text Block
                      </Button>
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Doctor Signature</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={sigInputRef} 
                        onChange={handleSignatureUpload} 
                      />
                      <Button 
                        onClick={() => sigInputRef.current?.click()} 
                        disabled={isUploadingSig}
                        variant="outline"
                        className="w-full border-slate-200 rounded-xl h-12 font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {isUploadingSig ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PenTool className="w-4 h-4 mr-2" />}
                        {editingTemplate.signatureUrl ? 'Replace Signature Image' : 'Upload Signature Image'}
                      </Button>
                      {editingTemplate.signatureUrl && (
                         <p className="text-[10px] text-emerald-600 mt-2 text-center font-medium">✓ Signature attached</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveTemplate}
                    className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-lg transition-all text-base font-semibold mt-4"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Save & Close
                  </Button>
                </div>
              </div>

              {/* Right Column: Live Preview Pane */}
              <div className="flex-1 bg-slate-200/50 flex flex-col items-center justify-center p-8 overflow-y-auto relative">
                {isAdvancedMode && (
                  <div className="absolute top-6 left-6 z-50 bg-emerald-100/90 backdrop-blur-sm border border-emerald-200 text-emerald-800 text-sm font-bold px-5 py-2.5 rounded-full shadow-lg animate-pulse flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4" />
                    DRAG BLOCKS TO POSITION
                  </div>
                )}
                
                <div className="relative shadow-2xl rounded-sm overflow-hidden min-h-[700px] w-full max-w-[700px] flex flex-col items-center justify-center mx-auto bg-white border border-slate-200">
                    <AutoScaledPreview 
                      overrideTemplate={editingTemplate} 
                      isSettingsPreview={true} 
                      onUpdateBlocks={isAdvancedMode ? (newBlocks: any) => {
                        setEditingTemplate({...editingTemplate, margins: {...editingTemplate.margins, blocks: newBlocks}});
                      } : undefined}
                      onUpdateTemplate={(newTemplate: any) => setEditingTemplate(newTemplate)}
                    />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
