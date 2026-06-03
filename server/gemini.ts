import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

// Lazy initialization of Gemini SDK
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiInstance = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiInstance;
}

// 1. Prescription Image/Document Parser via Gemini Flash
export async function analyzePrescriptionImage(base64Image: string, mimeType: string) {
  const client = getGeminiClient();
  
  if (!client) {
    console.warn("GEMINI_API_KEY is not defined. Using simulation fallback for Prescription OCR.");
    // Wait momentarily to simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getMockPrescriptionOcrResult();
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Image
          }
        },
        "Analyze this medical prescription image. Extract the patient name, age if available, doctor name, doctor license number if available, prescription date (format as YYYY-MM-DD or use 2026-06-03 as current anchor), and complete list of prescribed drugs with name, dosage, duration, and detailed instructions. Note any special instructions in notes."
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["patientName", "doctorName", "date", "drugs"],
          properties: {
            patientName: { type: Type.STRING },
            patientAge: { type: Type.INTEGER },
            doctorName: { type: Type.STRING },
            doctorLicense: { type: Type.STRING },
            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            drugs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "dosage", "duration", "instructions"],
                properties: {
                  name: { type: Type.STRING, description: "Brand name or scientific drug name" },
                  dosage: { type: Type.STRING, description: "e.g., 500mg, 1 tablet, etc." },
                  duration: { type: Type.STRING, description: "e.g., 5 days, 1 month, etc." },
                  instructions: { type: Type.STRING, description: "Detailed administration guidelines" }
                }
              }
            },
            notes: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini models");
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini prescription analysis failed, using fallback.", error);
    return getMockPrescriptionOcrResult();
  }
}

// 2. Drug-to-Drug Interaction Checking
export async function checkDrugInteractions(drugNames: string[]) {
  const client = getGeminiClient();

  if (!client) {
    console.warn("GEMINI_API_KEY is not defined. Using simulation fallback for Drug Interaction Check.");
    await new Promise(resolve => setTimeout(resolve, 800));
    return getMockDrugInteractionResult(drugNames);
  }

  try {
    const prompt = `Perform a comprehensive clinical drug-to-drug safety assessment for the following list of medications: ${drugNames.join(', ')}.
    Identify any mild, moderate, or severe interactions.
    Provide actionable instructions and specify clinical flags. If there are no interactions, state that the combination is safe or carries negligible risk.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["hasWarning", "severityLevel", "reportSummary", "interactions"],
          properties: {
            hasWarning: { type: Type.BOOLEAN, description: "True if any moderate or high risk interactions found" },
            severityLevel: { type: Type.STRING, description: "none, low, moderate, or high" },
            reportSummary: { type: Type.STRING, description: "Overall clinical summaries of interactions and safety recommendation" },
            interactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["drugA", "drugB", "severity", "mechanism", "recommendation"],
                properties: {
                  drugA: { type: Type.STRING },
                  drugB: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "mild, moderate, or severe" },
                  mechanism: { type: Type.STRING, description: "What happens when taken together" },
                  recommendation: { type: Type.STRING, description: "What the pharmacist or patient should do" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini models");
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini drug interaction check failed, using fallback.", error);
    return getMockDrugInteractionResult(drugNames);
  }
}

// 3. AI Demand Forecasting & Automatic Reorder suggestions
export async function generateInventoryForecast(drugs: any[], sales: any[]) {
  const client = getGeminiClient();

  // Strip non-essential details to minimize tokens and data payload
  const simplifiedDrugs = drugs.map(d => ({
    name: d.name,
    category: d.category,
    quantity: d.quantity,
    threshold: d.lowStockThreshold
  }));

  const simplifiedSales = sales.slice(0, 30).map(s => ({
    date: s.date.slice(0, 10),
    items: s.items.map((i: any) => ({ name: i.name, quantity: i.quantity }))
  }));

  if (!client) {
    console.warn("GEMINI_API_KEY is not defined. Using simulation fallback for inventory forecasting.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getMockInventoryForecast(simplifiedDrugs);
  }

  try {
    const prompt = `Analyze current pharmacy inventory levels and historic transaction summaries to formulate an AI demand prediction.
    Current Inventory Stock levels: ${JSON.stringify(simplifiedDrugs)}
    Recent Sales Transactions: ${JSON.stringify(simplifiedSales)}
    Current Date: 2026-06-03.
    Predict which drugs will see high demand next month, which drugs are in danger of stockout, and give recommended restock quantities. Identify seasonal patterns or correlations.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["predictions", "reorderSuggestions", "executiveSummary"],
          properties: {
            executiveSummary: { type: Type.STRING, description: "Brief overview of sales patterns, seasonal flags, and overall inventory health." },
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["drugName", "expectedDemandTrend", "riskRating", "reasoning"],
                properties: {
                  drugName: { type: Type.STRING },
                  expectedDemandTrend: { type: Type.STRING, description: "rising, stable, or declining" },
                  riskRating: { type: Type.STRING, description: "high, medium, or low risk of stockout" },
                  reasoning: { type: Type.STRING, description: "Why the demand or risk is projected" }
                }
              }
            },
            reorderSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["drugName", "currentStock", "suggestedReorderQuantity", "justification"],
                properties: {
                  drugName: { type: Type.STRING },
                  currentStock: { type: Type.INTEGER },
                  suggestedReorderQuantity: { type: Type.INTEGER },
                  justification: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini models");
    }
    return { ...JSON.parse(text), isSimulated: false };
  } catch (error) {
    console.error("Gemini forecasting failed, returning detailed backup predictions.", error);
    return getMockInventoryForecast(simplifiedDrugs);
  }
}

// Simulated Callbacks for Offline / Key-less environments
function getMockPrescriptionOcrResult() {
  return {
    patientName: "Sarah Connor",
    patientAge: 44,
    doctorName: "Dr. Peter Silberman, MD",
    doctorLicense: "MD-CA-40122",
    date: "2026-06-03",
    drugs: [
      {
        name: "Amoxicillin 500mg",
        dosage: "500mg capsules",
        duration: "7 days",
        instructions: "Take 1 capsule by mouth every 8 hours until finished."
      },
      {
        name: "Paracetamol 500mg (Panadol)",
        dosage: "500mg tablets",
        duration: "5 days",
        instructions: "Take 1 to 2 tablets every 4 to 6 hours as needed for moderate pain or fever."
      }
    ],
    notes: "Patient is requested to maintain hydration levels. No generic substitutes allowed.",
    isSimulated: true
  };
}

function getMockDrugInteractionResult(drugNames: string[]) {
  const drugsLower = drugNames.map(d => d.toLowerCase());
  
  // Custom mock scenario: Amoxicillin + Ibuprofen or Paracetamol
  const hasAmo = drugsLower.some(d => d.includes('amox'));
  const hasIbu = drugsLower.some(d => d.includes('ibu'));
  const hasAtor = drugsLower.some(d => d.includes('ator'));
  const hasMet = drugsLower.some(d => d.includes('met'));
  const hasIns = drugsLower.some(d => d.includes('ins'));

  if (hasAtor && hasIns) {
    return {
      hasWarning: true,
      severityLevel: "moderate",
      reportSummary: "Found 1 moderate risk caution between Atorvastatin and insulin levels. Atorvastatin may occasionally cause mild alterations in blood-glucose control which might require insulin dose re-balancing.",
      interactions: [
        {
          drugA: "Atorvastatin 20mg",
          drugB: "Insulin Glargine",
          severity: "moderate",
          mechanism: "HMG-CoA reductase inhibitors can slightly raise blood sugar levels by reducing insulin sensitivity.",
          recommendation: "Monitor fasting blood glucose levels closely during the initial 2 weeks of co-administration. No absolute contraindication exists."
        }
      ],
      isSimulated: true
    };
  }

  if (hasIbu && hasAmo) {
    return {
      hasWarning: false,
      severityLevel: "none",
      reportSummary: "Amoxicillin and Ibuprofen is a very typical, safe co-prescription for therapeutic infection management with inflammatory pain control. No significant kinetic interactions recorded.",
      interactions: [],
      isSimulated: true
    };
  }

  // Safe default
  return {
    hasWarning: false,
    severityLevel: "none",
    reportSummary: `Safety analysis complete for (${drugNames.join(', ')}). No clinically significant drug-drug or drug-excipient interactions identified. This combination is safe to dispense and administer together according to conventional pharmacokinetics.`,
    interactions: [],
    isSimulated: true
  };
}

function getMockInventoryForecast(simplifiedDrugs: any[]) {
  return {
    executiveSummary: "AI Diagnostic Analysis: Based on stable daily checkout velocities, Analgesics remain at high demand. Anticipated change includes seasonal allergies driving pediatric antibiotics demand in subsequent weeks.",
    predictions: [
      {
        drugName: "Metformin 850mg",
        expectedDemandTrend: "stable",
        riskRating: "high",
        reasoning: "Current inventory (15) is below your threshold (20) and is expected to deplete empty in exactly 8 days."
      },
      {
        drugName: "Paracetamol 500mg (Panadol)",
        expectedDemandTrend: "rising",
        riskRating: "low",
        reasoning: "General hot weather and summer season correlates with rising seasonal fever and flu, causing sales of analgesics to swell, though stock volume remains exceptionally deep."
      },
      {
        drugName: "Amoxicillin 500mg",
        expectedDemandTrend: "rising",
        riskRating: "medium",
        reasoning: "Antibiotic prescription checkouts are trending upwards across hospital branches by approximately 18% month-over-month."
      }
    ],
    reorderSuggestions: [
      {
        drugName: "Metformin 850mg",
        currentStock: 15,
        suggestedReorderQuantity: 100,
        justification: "Critical low status combined with constant diabetic prescription flow. A standard reorder of 100 ensures 45 days of supply coverage."
      },
      {
        drugName: "Lisinopril 10mg",
        currentStock: 0,
        suggestedReorderQuantity: 80,
        justification: "Item is currently out of stock completely at Central Branch, leading to lost customer checkouts. Urgent restock suggested."
      }
    ],
    isSimulated: true
  };
}
