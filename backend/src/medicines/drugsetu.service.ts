import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

export interface NormalizedMedicine {
  id: string;
  source: string;
  name: string;
  brandName?: string;
  genericName?: string;
  composition?: string;
  strength?: string;
  dosageForm?: string;
  route?: string;
  manufacturer?: string;
  packSize?: string;
  mrp?: string;
  sourceData?: any;
}

@Injectable()
export class DrugsetuService {
  private readonly logger = new Logger(DrugsetuService.name);
  private readonly apiKey = process.env.DRUGSETU_API_KEY;
  private readonly baseUrl = 'https://api.drugsetu.in/v1/medicines';

  /**
   * Search drugs via DrugSetu API
   */
  async searchDrugs(query: string): Promise<NormalizedMedicine[]> {
    if (!this.apiKey) {
      this.logger.warn('DrugSetu API Key not configured. Returning mocked/local data.');
      return this.getMockedDrugs(query);
    }

    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`DrugSetu API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Assuming response structure has a results array
      const items = Array.isArray(data) ? data : (data.results || data.data || []);
      
      return items.map((item: any) => this.normalizeResponse(item));
    } catch (error) {
      this.logger.error('Failed to search drugs from DrugSetu API', error);
      throw new HttpException('DrugSetu API Error', HttpStatus.BAD_GATEWAY);
    }
  }

  private normalizeResponse(item: any): NormalizedMedicine {
    // We attempt to map various likely fields based on standard medical databases
    return {
      id: item.id || item.product_id || item.sku || Math.random().toString(),
      source: 'drugsetu',
      name: item.name || item.brand_name || 'Unknown',
      brandName: item.brand_name || item.name,
      genericName: item.generic_name || item.salt || item.composition,
      composition: item.composition || item.salt || item.generic_name,
      strength: item.strength || item.potency,
      dosageForm: item.dosage_form || item.form || item.type,
      route: item.route || this.inferRoute(item.dosage_form || item.form || item.type),
      manufacturer: item.manufacturer || item.company_name || item.brand,
      packSize: item.pack_size || item.packaging,
      mrp: item.mrp || item.price,
      sourceData: item,
    };
  }
  
  private inferRoute(form?: string): string {
    if (!form) return 'Oral';
    const f = form.toLowerCase();
    if (f.includes('cream') || f.includes('ointment') || f.includes('gel') || f.includes('lotion') || f.includes('patch')) return 'Topical';
    if (f.includes('injection') || f.includes('iv') || f.includes('im')) return 'Intravenous/Intramuscular';
    if (f.includes('drop')) return 'Ophthalmic/Otic';
    if (f.includes('inhaler') || f.includes('respule') || f.includes('spray')) return 'Inhalation';
    if (f.includes('suppository')) return 'Rectal/Vaginal';
    return 'Oral';
  }

  private getMockedDrugs(query: string): NormalizedMedicine[] {
    const q = query.toLowerCase();
    const mockDatabase: NormalizedMedicine[] = [
      { id: 'DS-001', source: 'drugsetu', name: 'Augmentin 625 Duo', brandName: 'Augmentin', genericName: 'Amoxicillin + Clavulanic Acid', composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg', strength: '625mg', dosageForm: 'Tablet', route: 'Oral', manufacturer: 'GSK' },
      { id: 'DS-002', source: 'drugsetu', name: 'Augmentin 200mg/28.5mg', brandName: 'Augmentin', genericName: 'Amoxicillin + Clavulanic Acid', composition: 'Amoxicillin 200mg + Clavulanic Acid 28.5mg', strength: '228.5mg', dosageForm: 'Suspension', route: 'Oral', manufacturer: 'GSK' },
      { id: 'DS-003', source: 'drugsetu', name: 'Dolo 650', brandName: 'Dolo', genericName: 'Paracetamol', composition: 'Paracetamol', strength: '650mg', dosageForm: 'Tablet', route: 'Oral', manufacturer: 'Micro Labs' },
      { id: 'DS-004', source: 'drugsetu', name: 'Calpol', brandName: 'Calpol', genericName: 'Paracetamol', composition: 'Paracetamol', strength: '250mg/5ml', dosageForm: 'Syrup', route: 'Oral', manufacturer: 'GSK' },
      { id: 'DS-005', source: 'drugsetu', name: 'Pantocid 40', brandName: 'Pantocid', genericName: 'Pantoprazole', composition: 'Pantoprazole', strength: '40mg', dosageForm: 'Tablet', route: 'Oral', manufacturer: 'Sun Pharma' },
      { id: 'DS-006', source: 'drugsetu', name: 'Pantocid IV', brandName: 'Pantocid', genericName: 'Pantoprazole', composition: 'Pantoprazole', strength: '40mg', dosageForm: 'Injection', route: 'Intravenous', manufacturer: 'Sun Pharma' },
      { id: 'DS-007', source: 'drugsetu', name: 'Mupirocin', brandName: 'Bactroban', genericName: 'Mupirocin', composition: 'Mupirocin 2% w/w', strength: '2%', dosageForm: 'Ointment', route: 'Topical', manufacturer: 'GSK' },
      { id: 'DS-008', source: 'drugsetu', name: 'Asthalin', brandName: 'Asthalin', genericName: 'Salbutamol', composition: 'Salbutamol 100mcg', strength: '100mcg', dosageForm: 'Inhaler', route: 'Inhalation', manufacturer: 'Cipla' },
      { id: 'DS-009', source: 'drugsetu', name: 'Refresh Tears', brandName: 'Refresh', genericName: 'Carboxymethylcellulose', composition: 'Carboxymethylcellulose 0.5%', strength: '0.5%', dosageForm: 'Drops', route: 'Ophthalmic', manufacturer: 'Allergan' },
      { id: 'DS-010', source: 'drugsetu', name: 'Benadryl', brandName: 'Benadryl', genericName: 'Diphenhydramine', composition: 'Diphenhydramine', strength: '14mg/5ml', dosageForm: 'Syrup', route: 'Oral', manufacturer: 'Johnson & Johnson' },
    ];

    return mockDatabase.filter(d => 
      d.name.toLowerCase().includes(q) || 
      (d.genericName && d.genericName.toLowerCase().includes(q)) ||
      (d.brandName && d.brandName.toLowerCase().includes(q))
    );
  }
}
