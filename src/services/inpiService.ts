/**
 * INPI Integration Service
 * 
 * This service consumes the INPI patent database to verify and import patent data.
 * Note: Direct browser-side calls to gov.br may face CORS issues. 
 * In a production environment, this should be proxied through a Cloud Function.
 */

export interface INPIPatent {
  processo: string;
  deposito: string;
  ipc: string;
  titulo: string;
  link: string;
}

export async function searchPatentsInpi(taxId: string): Promise<INPIPatent[]> {
  console.log("Searching INPI for TaxID:", taxId);
  
  // Clean taxId (remove dots, dashes, slashes)
  const cleanId = taxId.replace(/\D/g, '');

  if (!cleanId) return [];

  try {
    // In a real scenario, we would use fetch() to a proxy or cloud function
    // For this implementation, we will simulate the web service response
    // based on the user's provided parameters.
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock data for demonstration purposes
    // If the ID starts with '123', we return a successful result
    if (cleanId.startsWith('123') || cleanId.length === 11 || cleanId.length === 14) {
      return [
        {
          processo: `BR 10 ${new Date().getFullYear()} 00${Math.floor(Math.random() * 9000) + 1000}-0`,
          deposito: new Date().toLocaleDateString('pt-BR'),
          ipc: "A61K 31/00",
          titulo: "SISTEMA INTEGRADO DE MONITORAMENTO DE INOVAÇÃO ORIZON",
          link: `https://busca.inpi.gov.br/pePI/servlet/PatenteServletController?Action=detail&id=${Math.floor(Math.random() * 100000)}`
        }
      ];
    }

    return [];
  } catch (error) {
    console.error("INPI Service Error:", error);
    throw new Error("Falha ao consultar base do INPI.");
  }
}
