/**
 * Comprime uma imagem no próprio navegador antes de salvar como base64
 * no Firestore (documento tem limite de 1MB). Redimensiona pela
 * largura máxima e reexporta como JPEG com qualidade reduzida — o
 * suficiente para servir de evidência visual, sem precisar do Firebase
 * Storage (que exigiria o plano Blaze).
 */
export function comprimirImagem(
  file: File,
  larguraMaxima = 1000,
  qualidade = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Não foi possível abrir a imagem."));
      img.onload = () => {
        const escala = Math.min(1, larguraMaxima / img.width);
        const largura = Math.round(img.width * escala);
        const altura = Math.round(img.height * escala);

        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas não suportado neste navegador."));
          return;
        }
        ctx.drawImage(img, 0, 0, largura, altura);
        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };
      img.src = leitor.result as string;
    };
    leitor.readAsDataURL(file);
  });
}

/** Tamanho aproximado em KB de uma string base64 (data URL). */
export function tamanhoAproximadoKB(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.round((base64.length * 0.75) / 1024);
}
