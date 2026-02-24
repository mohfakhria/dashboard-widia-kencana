"use client";
import { useRef, useState } from "react";
import Image from "next/image";

export default function QuotationModernLuxury() {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [showWatermark, setShowWatermark] = useState(true);

  // =============================
  // 🧩 Data: SCP Renewal Machine
  // =============================
  const sections = [
    {
      title: "A. Core Control System",
      items: [
        { name: "PLC Omron CJ-Series CPU", qty: 1, unit: "Unit", price: 42000000 },
        { name: "Power Supply Omron 100–240V", qty: 1, unit: "Unit", price: 6000000 },
        { name: "Input Module Omron CJ-Series", qty: 2, unit: "Unit", price: 9000000 },
        { name: "Output Module Omron CJ-Series", qty: 2, unit: "Unit", price: 9000000 },
        { name: "HMI Proface 5.7” TFT Color PFXGP", qty: 1, unit: "Unit", price: 31000000 },
        { name: "HMI Communication Cable", qty: 1, unit: "Set", price: 5000000 },
        { name: "Omron MY2N 24VDC + Socket", qty: 12, unit: "Set", price: 1500000 },
        { name: "Solenoid SMC SY3120", qty: 3, unit: "Set", price: 3000000 },
        { name: "Solenoid Koganei 180", qty: 1, unit: "Set", price: 3500000 },
        { name: "Pressure Switch SMC ZSE4", qty: 1, unit: "Set", price: 7500000 },
        { name: "Power Supply 24VDC NES-75", qty: 1, unit: "Unit", price: 2500000 },
        { name: "Contactor Fuji 220VAC", qty: 2, unit: "Unit", price: 2000000 },
        { name: "MCB Fuji EA2 Series", qty: 1, unit: "Unit", price: 1500000 },
      ],
    },
    {
      title: "B. Supporting Components",
      items: [
        { name: "Panel Fan Generic 220VAC", qty: 2, unit: "Pcs", price: 1250000 },
        { name: "Kabel Control NYAF 1.5mm² warna-warni", qty: 1, unit: "Lot", price: 2500000 },
        { name: "Kabel Power NYY 2.5mm² / 4mm²", qty: 1, unit: "Lot", price: 1500000 },
        { name: "Solid State Relay", qty: 2, unit: "Pcs", price: 1250000 },
        { name: "Terminal Jumper, Ground Bar, End Plate Set", qty: 1, unit: "Lot", price: 1250000 },
        { name: "DC Fuse + Fuse Protection for PLC & I/O", qty: 1, unit: "Lot", price: 4000000 },
        { name: "Cable Duct, Tie Mount, Heatshrink Label", qty: 1, unit: "Lot", price: 1500000 },
        { name: "Miscellaneous", qty: 1, unit: "Lot", price: 2000000 },
      ],
    },
    {
      title: "C. Labour",
      items: [
        { name: "8 Pekerjaan", qty: 1, unit: "Lot", price: 95000000 },
      ],
      details: [
        "Dismantle system lama (PLC, HMI, Relay, Valve)",
        "Instalasi PLC & Modul (CJ System)",
        "Instalasi HMI Proface",
        "Rewiring panel & Penggantian Relay, Valve, Power & Fan",
        "Cable Routing & Labeling",
        "Programming PLC (Konversi Logic + Debugging)",
        "Programming HMI",
        "Commissioning & Functional Test",
      ],
    },
    
  ];

  // Tambahkan state untuk notes (input dari form / database)
  const [notes, setNotes] = useState<string[]>([
    "Harga belum termasuk PPN 11%.",
    "Garansi pekerjaan selama 1 bulan.",
    "Pekerjaan dilakukan setelah terima PO.",
    "Waktu pekerjaan selama 1 bulan.",
  ]);

  // =============================
  // 💰 Perhitungan Total
  // =============================
  const formatRp = (num: number) =>
    `Rp ${num.toLocaleString("id-ID", { minimumFractionDigits: 0 })}`;

  const grandTotal = sections
    .flatMap((s) => s.items)
    .reduce((acc, i) => acc + i.price * i.qty, 0);

  const discount = grandTotal * 0.05;
  const total = grandTotal - discount;

  // =============================
  // 🧾 Generate PDF
  // =============================

  const handleGeneratePDF = async () => {
    const element = pdfRef.current;
    setShowWatermark(false); // 🔹 sembunyiin watermark DOM sementara
    if (!element) return;

    // Dynamic import html2pdf biar aman di Next.js
    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: 0,
      filename: "Quotation-WK-QT-2025-001.pdf",
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    await (html2pdf() as any)
      .set(opt)
      .from(element)
      .toPdf()
      .get("pdf")
      .then(async (pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();

        // Ambil gambar dan ubah ke versi transparan via canvas
        const img = new window.Image();
        img.src = "/images/widia-kencana/logo-widia.png";

        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Buat canvas sementara untuk ubah opacity
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const size = 300; // ukuran logo dalam px
        canvas.width = size;
        canvas.height = size;

        ctx.globalAlpha = 0.05; // 🎯 di sinilah opacity-nya kita atur (0.0 - 1.0)
        ctx.drawImage(img, 0, 0, size, size);

        const transparentLogo = canvas.toDataURL("image/png");

        // Tambahkan watermark di setiap halaman
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          const logoWidth = 180;
          const logoHeight = 110;
          const x = (pageWidth - logoWidth) / 2;
          const y = (pageHeight - logoHeight) / 2;

          pdf.addImage(transparentLogo, "PNG", x, y, logoWidth, logoHeight);
        }

        pdf.save("Quotation-WK-QT-2025-001.pdf");
      });
      setShowWatermark(true); // 🔹 tampilkan lagi watermark DOM
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] py-10 flex flex-col items-center">
      {/* Tombol Generate PDF */}
      <button
        onClick={handleGeneratePDF}
        className="mb-6 px-5 py-2 bg-[#c4a73e] text-white text-sm font-medium rounded-lg hover:bg-[#b6972a] transition-all shadow-md print:hidden"
      >
        Export to PDF
      </button>

      {/* Konten PDF */}
     <div
        ref={pdfRef}
        id="quotation-content"
        className="relative bg-white border border-[#e6e0cf] max-w-[210mm] w-full shadow-lg rounded-2xl p-10 overflow-hidden page"
      >
        {showWatermark && (
          
          <div className="absolute inset-0 flex justify-center items-center opacity-[0.06] pointer-events-none">
            <Image
              src="/images/widia-kencana/logo-widia.png"
              alt="Watermark"
              width={650}
              height={650}
            />
          </div>
        )}

        {/* Header */}
        <header className="relative border-b border-[#e6e0cf] pb-3 mb-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
                <Image
                    src="/images/widia-kencana/widia-kencana.png"
                    alt="Logo"
                    width={400}
                    height={0}
                />              
            </div>
          </div>

          <div className="text-right text-xs">
            <p className="text-[#c4a73e] font-semibold">
              Quotation No. WK-QT-2025-001
            </p>
            <p className="text-gray-500">Tanggal: 26 Oktober 2025</p>
          </div>
        </header>

        {/* Kepada */}
       <section className="mb-8 leading-tight">
          <h2 className="font-semibold text-gray-800 text-sm mb-1">
              Kepada Yth:
          </h2>
          <p className="text-sm font-medium text-gray-800">
              UTAC Manufacturing Services Indonesia
          </p>
          <p className="text-sm text-gray-600 mb-5">
              Jl. Maligi I Lot A1 -4 Kawasan Industri KIIC Karawang 41361
          </p>

          <p className="text-[13px] text-brand-600 font-medium tracking-wide">
              Attn: <span className="text-gray-900 text-sm">Bapak Eeng Hernawan</span>{" "}
              <span className="text-gray-600 font-normal">– Purchasing Dept.</span>
          </p>

          {/* Garis halus separator */}
          <div className="border-t border-gray-200 my-3 w-3/3"></div>
          
          {/* Project Info */}
         <p className="leading-tight">
            <span className="text-gray-600 text-sm">Project:</span>{" "}
            <span className="text-sm px-1 py-[1px] bg-[#FFF6D6] text-brand-600 font-semibold rounded-sm">
              SCP Renewal Machine
            </span>
          </p>
        </section>

       {/* Table */}
        {sections.map((section, si) => (
          <div key={si} className="mb-6 page-break-inside-avoid">
            <h3 className="text-[#b08a24] font-semibold text-sm mb-2">
              {section.title}
            </h3>
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-800 text-white text-sm">
                  <th className="text-left p-2 w-8 border border-gray-700">No</th>
                  <th className="text-left p-2 border border-gray-700">
                    Nama Barang / Pekerjaan
                  </th>
                  <th className="text-center p-2 w-20 border border-gray-700">
                    Qty
                  </th>
                  <th className="text-right p-2 w-28 border border-gray-700">
                    Harga
                  </th>
                  <th className="text-right p-2 w-32 border border-gray-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-[#faf9f5] transition even:bg-[#faf9f5]"
                  >
                    <td className="p-2 text-sm text-gray-700 border border-gray-200 text-center">
                      {index + 1}
                    </td>
                    <td className="p-2 text-sm text-gray-800 border border-gray-200">
                      {item.name}
                    </td>
                    <td className="p-2 text-center text-sm text-gray-700 border border-gray-200">
                      {item.qty} {" "} {item.unit}
                    </td>
                    <td className="p-2 text-right text-sm text-gray-700 border border-gray-200">
                      {formatRp(item.price)}
                    </td>
                    <td className="p-2 text-right text-sm text-gray-700 border border-gray-200">
                      {formatRp(item.price * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {section.details && (
              <div className="border border-gray-200 rounded-lg p-3 bg-[#fdfcf8] text-sm text-gray-700">
                <h4 className="font-semibold text-brand-600 mb-3">
                  Rincian Pekerjaan:
                </h4>
                <div className="space-y-[2px] leading-[1.5]">
                  {section.details.map((d, di) => (
                    <div key={di} className="flex items-start gap-2">
                      <span className="font-medium w-5 text-right">{di + 1}.</span>
                      <span className="flex-1">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
          
        ))}      

         {/* Total */}
        <div className="flex justify-end text-sm mt-8 mb-10">
          <div className="text-right">
            <p className="text-gray-600">
              Sub Total: <span className="font-medium text-gray-800">{formatRp(grandTotal)}</span>
            </p>
            <p className="text-gray-600">
              Disc 5%: <span className="font-medium text-gray-800">{formatRp(discount)}</span>
            </p>
            <p className="text-[15px] font-semibold text-brand-600 mt-2">
              Total: {formatRp(total)}
            </p>
          </div>
        </div>

        {/* Catatan */}
        <section className="mb-10">
          <div className="border border-gray-200 rounded-md bg-[#fdfcf8] p-3">
            <h3 className="font-semibold text-gray-700 text-sm mb-2">Catatan:</h3>
            <div className="text-[13px] text-gray-700 leading-relaxed space-y-[2px]">
              {notes.length ? (
                notes.map((n, i) => <p key={i}>• {n}</p>)
              ) : (
                <p>– Tidak ada catatan –</p>
              )}
            </div>
          </div>
        </section>

        

       {/* Signature */}
        <section className="flex justify-end text-sm">
            <div className="text-right">
                <p className="text-gray-600 mb-20">Hormat Kami,</p>
                <p className="font-semibold text-gray-800">PT. Widia Kencana</p>
            </div>
        </section>

        {/* Generated Text — di atas footer */}
        <div className="text-left text-[11px] italic mt-10 mb-1 text-gray-500 hover:text-[#c4a73e] transition">
            Generated from Dashboard Widia Kencana – 
             
            {" "} https://dashboard.widiakencana.com
            
        </div>

        {/* Footer */}
        <footer className="border-t border-[#e6e0cf] pt-3 text-[10pt] flex justify-between text-gray-600">
            <p>© 2025 PT. Widia Kencana | All rights reserved.</p>
            <p>
                Jl. Cihanjuang No. 180A, Cimahi 40513 |{" "}
                <span className="text-gray-800 font-medium">
                widia.kencana@yahoo.com
                </span>
            </p>
        </footer>
      </div>
    </div>
  );
}