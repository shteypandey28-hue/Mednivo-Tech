import { forwardRef, useEffect, useState, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { usePrescriptionStore } from '@/store/prescriptionStore';
import { format } from 'date-fns';
import api from '@/lib/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';

export const AutoScaledPreview = ({ overrideTemplate, isSettingsPreview, onUpdateBlocks, onUpdateTemplate }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
  
    useEffect(() => {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          const scaleW = width / 595;
          const scaleH = height / 842;
          setScale(Math.min(scaleW, scaleH) * 0.98); // 98% to leave a tiny padding
        }
      });
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, []);
  
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute origin-center shadow-xl overflow-hidden bg-white" 
          style={{ width: '595px', height: '842px', transform: `scale(${scale})` }}
        >
          <PrescriptionPreview 
            overrideTemplate={overrideTemplate} 
            isSettingsPreview={isSettingsPreview} 
            onUpdateBlocks={onUpdateBlocks} 
            onUpdateTemplate={onUpdateTemplate} 
          />
        </div>
      </div>
    );
};

type PrescriptionPreviewProps = {
    overrideTemplate?: any;
    isSettingsPreview?: boolean;
    onUpdateBlocks?: (blocks: any) => void;
    onUpdateTemplate?: (template: any) => void;
};

export const PrescriptionPreview = forwardRef((props: PrescriptionPreviewProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const { overrideTemplate, isSettingsPreview, onUpdateBlocks } = props;
    const { patient, medicines } = usePrescriptionStore();
    const date = format(new Date(), 'dd MMM yyyy');
    const [fetchedTemplate, setFetchedTemplate] = useState<any>(null);

    useEffect(() => {
        if (overrideTemplate) return;
        const fetchDefaultTemplate = async () => {
            try {
                const { data } = await api.get('/clinic/print-templates');
                const defaultTpl = data.find((t: any) => t.isDefault) || data[0];
                if (defaultTpl) setFetchedTemplate(defaultTpl);
            } catch (e) {
                console.error("Failed to fetch templates for preview", e);
            }
        };
        fetchDefaultTemplate();
    }, [overrideTemplate]);

    const template = overrideTemplate || fetchedTemplate;
    const margins = template?.margins || { top: 100, bottom: 50, left: 50, right: 50 };

    const blocks = margins?.blocks;
    const customTexts = margins?.customTexts || [];
    const isDraggable = !!onUpdateBlocks;
    const useAbsoluteLayout = isDraggable || !!blocks;

    const DraggableBlock = ({ id, defaultX, defaultY, width = 495, children }: any) => {
        const pos = blocks?.[id] || { x: defaultX, y: defaultY };
        const x = useMotionValue(pos.x);
        const y = useMotionValue(pos.y);

        useEffect(() => {
            x.set(pos.x);
            y.set(pos.y);
        }, [pos.x, pos.y, x, y]);

        if (isDraggable) {
            return (
                <motion.div
                    style={{ x, y, width: width === 'auto' ? 'auto' : `${width}px` }}
                    drag
                    dragMomentum={false}
                    onDragEnd={() => {
                        if (onUpdateBlocks) {
                            onUpdateBlocks({ 
                                ...blocks, 
                                [id]: { x: Math.round(x.get()), y: Math.round(y.get()) } 
                            });
                        }
                    }}
                    className={`absolute top-0 left-0 border-2 border-dashed border-emerald-500 bg-white/60 cursor-move p-2 rounded shadow-md z-50`}
                >
                    {children}
                </motion.div>
            );
        }

        if (useAbsoluteLayout) {
            return (
                <div style={{ position: 'absolute', left: pos.x, top: pos.y, width: width === 'auto' ? 'auto' : `${width}px` }} className="z-10">
                    {children}
                </div>
            );
        }

        return <div className="mb-4 w-full flex-shrink-0">{children}</div>;
    };

    return (
        <div 
            ref={ref} 
            className="bg-white flex flex-col text-sm relative overflow-hidden mx-auto w-full h-full border border-slate-200"
        >
            {template?.headerImageUrl && (
                <div 
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{ 
                        backgroundImage: `url(http://localhost:3000${template.headerImageUrl})`,
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'top center'
                    }}
                />
            )}

            <div 
                className={`relative z-10 flex flex-col h-full ${useAbsoluteLayout ? '' : 'p-10'}`}
                style={useAbsoluteLayout ? {} : {
                    paddingTop: `${(margins.top / 595.28) * 100}%`,
                    paddingBottom: `${(margins.bottom / 595.28) * 100}%`,
                    paddingLeft: `${(margins.left / 595.28) * 100}%`,
                    paddingRight: `${(margins.right / 595.28) * 100}%`,
                }}
            >
                {/* Fallback header if NO custom image and NOT using absolute layout */}
                {!template?.headerImageUrl && !useAbsoluteLayout && (
                    <header className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start text-black">
                        <div>
                            <h1 className="text-2xl font-bold">{template?.name || 'Mednivo Clinic'}</h1>
                            <p className="font-semibold">Dr. Name</p>
                        </div>
                    </header>
                )}

                {/* Patient Info */}
                <DraggableBlock id="patient" defaultX={50} defaultY={150} width="auto">
                    <div className="text-sm pb-1">
                        <span className="font-semibold text-slate-800">Patient:</span> 
                        <span className="font-bold text-slate-900 ml-1">
                            {isSettingsPreview ? 'Dummy Name' : (patient.name || '___________')}
                        </span>
                    </div>
                </DraggableBlock>

                {/* Date Info */}
                <DraggableBlock id="date" defaultX={400} defaultY={150} width="auto">
                    <div className="text-sm pb-1">
                        <span className="font-semibold text-slate-800">Date:</span> 
                        <span className="text-slate-900 ml-1">
                            {isSettingsPreview ? '01 Jan 2026' : date}
                        </span>
                    </div>
                </DraggableBlock>

                {(!isSettingsPreview && (usePrescriptionStore.getState().notes || usePrescriptionStore.getState().diagnosis)) || (isSettingsPreview) ? 
                    <DraggableBlock id="advice" defaultX={50} defaultY={220}>
                        <div className="text-slate-900">
                            <span className="font-semibold block underline">Advice / Notes</span>
                            <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                                {isSettingsPreview ? 'General health advice goes here.' : (
                                    <>
                                        {usePrescriptionStore.getState().diagnosis && <div><strong>Dx:</strong> {usePrescriptionStore.getState().diagnosis}</div>}
                                        {usePrescriptionStore.getState().notes}
                                    </>
                                )}
                            </div>
                        </div>
                    </DraggableBlock> : null
                }

                <DraggableBlock id="medicines" defaultX={50} defaultY={320}>
                    <div className="mt-2">
                        <h3 className="font-semibold text-slate-900 underline mb-3 text-lg">Medicines</h3>
                        {isSettingsPreview ? (
                            <div className="space-y-4">
                                <div className="text-sm text-slate-900">
                                    <div className="font-bold">1. Tab. DummyMedicine 500mg - 1 Tab</div>
                                    <div className="pl-4 text-xs text-slate-700">Frequency: 1-0-1 | Duration: 5 Days</div>
                                </div>
                                <div className="text-sm text-slate-900">
                                    <div className="font-bold">2. Syr. ExampleCough 100ml - 5 ml</div>
                                    <div className="pl-4 text-xs text-slate-700">Frequency: 1-1-1 | Duration: 3 Days</div>
                                </div>
                            </div>
                        ) : medicines.length === 0 ? (
                            <p className="text-slate-400 italic text-center mt-10">No medicines prescribed yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {medicines.map((med, index) => (
                                    <div key={index} className="text-sm text-slate-900">
                                        <div className="font-bold">{index + 1}. {med.name} - {med.dosage}</div>
                                        <div className="pl-4 text-xs text-slate-700">Frequency: {med.frequency} | Duration: {med.duration}</div>
                                        {med.instruction && (
                                            <div className="pl-4 text-xs text-slate-600">Note: {med.instruction}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DraggableBlock>

                {/* Signature */}
                {template?.signatureUrl ? (
                    <DraggableBlock id="signature" defaultX={400} defaultY={700} width="auto">
                        <img 
                            src={`http://localhost:3000${template.signatureUrl}`} 
                            alt="Doctor Signature" 
                            className="h-16 w-auto object-contain opacity-90 mix-blend-multiply" 
                        />
                    </DraggableBlock>
                ) : (
                    !template?.headerImageUrl && !useAbsoluteLayout && (
                        <div className="mt-auto text-right text-slate-800 pt-10">
                            <div className="border-t-2 border-slate-800 w-48 ml-auto pt-2 font-semibold">
                                Doctor's Signature
                            </div>
                        </div>
                    )
                )}
            </div>
            {/* Dynamic Custom Text Blocks */}
            {customTexts.map((ct: any) => {
                const CustomTextWrapper = ({ children }: any) => {
                    const pos = { x: ct.x || 50, y: ct.y || 100 };
                    const x = useMotionValue(pos.x);
                    const y = useMotionValue(pos.y);
                    
                    useEffect(() => {
                        x.set(pos.x);
                        y.set(pos.y);
                    }, [pos.x, pos.y, x, y]);

                    if (isDraggable) {
                        return (
                            <motion.div
                                style={{ x, y, width: ct.width || 495 }}
                                drag
                                dragMomentum={false}
                                onDragEnd={() => {
                                    if (props.onUpdateTemplate) {
                                        const updatedCustomTexts = customTexts.map((item: any) => 
                                            item.id === ct.id ? { ...item, x: Math.round(x.get()), y: Math.round(y.get()) } : item
                                        );
                                        props.onUpdateTemplate({ ...template, margins: { ...margins, customTexts: updatedCustomTexts }});
                                    }
                                }}
                                className="absolute top-0 left-0 border-2 border-dashed border-emerald-500 bg-white cursor-move rounded shadow-md z-[60]"
                            >
                                <div className="p-1 bg-emerald-50 flex justify-between items-center border-b border-emerald-200">
                                    <span className="text-[10px] text-emerald-800 font-bold px-1">Custom Block</span>
                                    <button 
                                      onPointerDown={(e) => {
                                        e.stopPropagation();
                                        if (props.onUpdateTemplate) {
                                            const filtered = customTexts.filter((item: any) => item.id !== ct.id);
                                            props.onUpdateTemplate({ ...template, margins: { ...margins, customTexts: filtered }});
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 text-xs px-2"
                                    >
                                        Remove
                                    </button>
                                </div>
                                {children}
                            </motion.div>
                        );
                    }
                    if (useAbsoluteLayout) {
                        return <div style={{ position: 'absolute', left: pos.x, top: pos.y, width: ct.width || 495 }} className="z-10">{children}</div>;
                    }
                    return <div className="mb-4">{children}</div>;
                };

                return (
                    <CustomTextWrapper key={ct.id}>
                        {isDraggable ? (
                            <div className="custom-quill-container" onPointerDown={(e) => e.stopPropagation()}>
                                <ReactQuill 
                                    theme="snow"
                                    value={ct.html}
                                    onChange={(val) => {
                                        if (props.onUpdateTemplate) {
                                            const updatedCustomTexts = customTexts.map((item: any) => 
                                                item.id === ct.id ? { ...item, html: val } : item
                                            );
                                            props.onUpdateTemplate({ ...template, margins: { ...margins, customTexts: updatedCustomTexts }});
                                        }
                                    }}
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline'],
                                            [{ 'align': [] }],
                                            [{ 'color': [] }]
                                        ]
                                    }}
                                />
                            </div>
                        ) : (
                            <div 
                              className="prose prose-sm max-w-none" 
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ct.html) }} 
                            />
                        )}
                    </CustomTextWrapper>
                );
            })}

        </div>
    );
});

PrescriptionPreview.displayName = 'PrescriptionPreview';
