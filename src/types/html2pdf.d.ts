declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: Record<string, any>;
    html2canvas?: Record<string, any>;
    jsPDF?: Record<string, any>;
    pagebreak?: Record<string, any>;
  }

  interface Html2Pdf {
    from(element: HTMLElement): this;
    set(options: Html2PdfOptions): this;
    save(): void;
  }

  function html2pdf(): Html2Pdf;
  export default html2pdf;
}