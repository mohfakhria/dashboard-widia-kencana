"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import axiosClient from "@/lib/axiosClient";


interface QuotationProps {
  mode?: "add" | "edit"; // 👈 baru
  quotationId?: string | number; // 👈 baru

  client: string;
  project: string;
  date: string;
  attnName?: string;
  attnPosition?: string;
  address?: string;
  quotationNo?: string;
  sections: {
    title: string;
    type: "item" | "rincian";
    items?: { name: string; qty: number; unit: string; price: number }[];
    details?: string[];
  }[];
  notes: string[];
  discount?: {
    type: "percent" | "amount";
    value: number;
  };  
}

export default function QuotationTemplate({
  mode = "add",
  quotationId,
  client,
  project,
  date,
  attnName,
  attnPosition,
  quotationNo: quotationNoProp,
  address,
  sections,
  notes,
  discount,  
  
}: QuotationProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [showWatermark, setShowWatermark] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [quotationNo, setQuotationNo] = useState<string | null>(quotationNoProp || null);

  // =============================
  // 💰 Perhitungan Total
  // =============================
  const formatRp = (num: number) =>
    `Rp ${num.toLocaleString("id-ID", { minimumFractionDigits: 0 })}`;

  const subTotal = sections
    .flatMap((s) => s.items || [])
    .reduce((acc, i) => acc + (i.price || 0) * (i.qty || 0), 0);

    

  const discountAmount =
    discount?.type === "percent"
      ? subTotal * ((discount?.value || 0) / 100)
      : discount?.value || 0;
  const total = subTotal - discountAmount;

  const formattedDate = new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // =============================
  // 🧾 Handle Save
  // =============================

  const handleSave = async () => {
    if (isSaved && mode !== "edit") {
      toast.error("Quotation sudah disimpan, refresh halaman untuk membuat baru.");
      return;
    }

    setIsSaving(true);

    try {

      const formattedSections = sections.map((s, si) => ({
        title: s.title,
        position: si + 1,
        items: (s.items || []).map((i) => ({
          name: i.name,
          qty: i.qty,
          unit: i.unit,
          price: i.price,
        })),
        details: (s.details || []).map((d, di) => ({
          description: d,
          position: di + 1,
        })),
      }));

      const payload = {
        client_name: client,
        attn_name: attnName,
        attn_position: attnPosition,
        address,
        project,
        sections: formattedSections,
        notes,
        discount_type: discount?.type,
        discount_value: discount?.value,
        subtotal: subTotal,
        total: total,
      };

      let res;
      
      if (mode === "edit" && quotationId) {
        res = await axiosClient.put(`/quotation-update/${quotationId}`, payload, {
          withCredentials: true,
        });
        toast.success("Quotation berhasil diperbarui!");        
      } else {
        res = await axiosClient.post("/quotation-add", payload, {
          withCredentials: true,
        });
        const quotationNo = res.data.data?.quotationNo;
        setQuotationNo(quotationNo);
        toast.success(`Quotation baru berhasil disimpan!`);
      }     

    setIsSaved(true);

  } catch (err: any) {
    // ❌ error
    console.error("Gagal menyimpan quotation:", err);
    const msg =
      err.response?.data?.message ||
      err.message ||
      "Gagal menyimpan quotation";
    toast.error(msg);
  }
    
    
    
  };

  // =============================
  // 🧾 Generate PDF
  // =============================
  const handleGeneratePDF = async () => {
    const element = pdfRef.current;
    setShowWatermark(false);
    if (!element) return;

    const html2pdf = (await import("html2pdf.js")).default;

    const filename =
      quotationNo && quotationNo.trim() !== ""
        ? `Quotation-${quotationNo}.pdf`
        : `Quotation-${client.replace(/\s+/g, "_")}.pdf`;

    const opt = {
      margin: 0,
      filename,
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

        const img = new window.Image();
        img.src = "/images/widia-kencana/logo-widia.png";

        await new Promise((resolve) => (img.onload = resolve));

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        ctx.globalAlpha = 0.05;
        ctx.drawImage(img, 0, 0, size, size);
        const transparentLogo = canvas.toDataURL("image/png");

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

        pdf.save(filename);
      });

    setShowWatermark(true);
  };

  // =============================
  // 🎨 UI
  // =============================
  return (
    <div className="min-h-screen bg-[#f8f8f8] py-10 flex flex-col items-center">
      <div className="flex justify-end gap-3 mt-6">
        {/* Tombol Save */}
        <button
          onClick={handleSave}          
          className="mb-6 px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-all shadow-md print:hidden"
        >
          {(mode === "edit") ? "Update" : "Save"}
        </button>

        {/* Tombol Generate PDF */}
        <button
          
          onClick={() => {
              if (!isSaved) {
                toast.error("💡 Simpan dulu sebelum export ke PDF");
                return;
              }
              handleGeneratePDF();
            }}
          className="mb-6 px-5 py-2 bg-[#c4a73e] text-white text-sm font-medium rounded-lg hover:bg-[#b6972a] transition-all shadow-md print:hidden"
        >
          Export to PDF
        </button>
      </div>

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
              Quotation No: {quotationNo}
            </p>
            <p className="text-gray-500">Tanggal: {formattedDate}</p>
          </div>
        </header>

        {/* Kepada */}
        <section className="mb-8 leading-tight">
          <h2 className="font-semibold text-gray-800 text-sm mb-1">
              Kepada Yth:
          </h2>
          <p className="text-sm font-medium text-gray-800">
              {client}
          </p>
          <p className="text-sm text-gray-600 mb-5">
              {address}
          </p>

          <p className="text-[13px] text-brand-600 font-medium tracking-wide">
              Attn: <span className="text-gray-900 text-sm">{attnName}</span>{" "}
              <span className="text-gray-600 font-normal">– {attnPosition}</span>
          </p>

          {/* Garis halus separator */}
          <div className="border-t border-gray-200 my-3 w-3/3"></div>
          
          {/* Project Info */}
          <p className="leading-tight">
            <span className="text-gray-600 text-sm">Project:</span>{" "}
            <span className="text-sm px-1 py-[1px] bg-[#FFF6D6] text-brand-600 font-semibold rounded-sm">
              {project}
            </span>
          </p>
        </section>

        {/* Table */}
        {sections.map((section, si) => (
          <div key={si} className="mb-6 page-break-inside-avoid">
            <h3 className="text-[#b08a24] font-semibold text-sm mb-2">
              {section.title}
            </h3>
            {section.type === "item" && section.items && section.items.length > 0 && (
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
            )}
            {section.details && section.details.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 bg-[#fdfcf8] text-sm text-gray-700">
                <h4 className="font-semibold text-brand-600 mb-3">
                  Rincian Material / Pekerjaan:
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
            {discount && Number(discount.value) > 0 ? (
              <>
                <p className="text-gray-600">
                  Sub Total:{" "}
                  <span className="font-medium text-gray-800">{formatRp(subTotal)}</span>
                </p>
                <p className="text-gray-600">
                  Disc {discount.type === "percent" && `${discount.value}%`} :{" "}
                  <span className="font-medium text-gray-800">{formatRp(discountAmount)}</span>
                </p>
              </>
            ) : null}
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
            <p className="text-gray-600 mb-[25px] print:mb-[15px]">Hormat Kami,</p>

            <div className="relative w-[180px] h-[55px] inline-block">
              {/* Cap perusahaan (background) */}
              <Image
                src="/images/widia-kencana/stamp-widia.png"
                alt="Stamp"
                width={150}
                height={0}
                className="absolute left-[105px] -translate-x-1/2 top-4 opacity-70 object-contain"
              />

              {/* Tanda tangan di atas cap */}
              <Image
                src="/images/widia-kencana/ttd-fakhri.png"
                alt="Signature"
                width={90}
                height={0}
                className="absolute left-[120px] -translate-x-1/2 top-0 object-contain"
              />
            </div>

            <p className="font-semibold text-gray-800 mt-5">
              MOH. FAKHRI ARDIYANTO
            </p>
          </div>
        </section>

        {/* Generated Text — di atas footer */}
        <div className="text-left text-[11px] italic mt-10 mb-1 text-gray-500 hover:text-[#c4a73e] transition">
            Generated from Dashboard Widia Kencana 2.0
              
             {/* – {" "} https://dashboard.widiakencana.com */}
            
        </div>

        {/* Footer */}
        <footer className="border-t border-[#e6e0cf] pt-3 text-[10pt] flex justify-between text-gray-600">
            <p>© {new Date().getFullYear()} PT. Widia Kencana | All rights reserved.</p>
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