"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import QuotationTemplate from "@/components/quotation/QuotationTemplate";
import toast from "react-hot-toast";
import axiosClient from "@/lib/axiosClient";



export default function QuotationFormPage() {
  const { id } = useParams();
  const isAdd = id === "new"; // ✅ kalau "new" berarti mode tambah
  const isEdit = !isAdd; // ✅ kalau angka berarti mode edit
  const [loading, setLoading] = useState(isEdit);

  const [client, setClient] = useState("PT. UTAC Manufacturing Services Indonesia");
  const [attnName, setAttnName] = useState("Bapak Eeng Hernawan");
  const [attnPosition, setAttnPosition] = useState("Purchasing Dept.");
  const [address, setAddress] = useState("Jl. Maligi I Lot A1-4 Kawasan Industri KIIC Karawang 41361");
  const [project, setProject] = useState("");
  const defaultNotes = [
    "Pembayaran dilakukan 30 (tiga puluh) hari setelah invoice diterima oleh bagian Accounting.",
    "Harga belum termasuk Pajak Pertambahan Nilai (PPN)."
  ];

  const [notes, setNotes] = useState<string[]>(defaultNotes);
  const [newNote, setNewNote] = useState("");
  const [quotationNo, setQuotationNo] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountInput, setDiscountInput] = useState("");

  const hasFetched = useRef(false);


  // === Fetch quotation saat edit ===
  useEffect(() => {
     if (hasFetched.current || !isEdit) return;
      hasFetched.current = true;

    const fetchData = async () => {
      try {
        const res = await axiosClient.get(`/quotation-detail/${id}`);
        const q = res.data.data;

        setClient(q.client_name);
        setAttnName(q.attn_name);
        setAttnPosition(q.attn_position);
        setAddress(q.address);
        setProject(q.project);
        setDiscountType(q.discount_type);
        setDiscountValue(q.discount_value);
        setDiscountInput(q.discount_value);
        setNotes(q.notes || []);
        setQuotationNo(q.quotation_no)
        // ✅ Normalisasi sections agar cocok dengan struktur template
        const normalizedSections = (q.sections || []).map((s: any) => ({
          title: s.title,
          type: "item",
          items: (s.items || []).map((i: any) => ({
            name: i.name,
            qty: i.qty,
            unit: i.unit,
            price: i.price,
          })),
          details: (s.details || []).map((d: any) => d.description),
        }));

        setSections(normalizedSections);

        toast.success("Quotation loaded!");
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data quotation");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

   // Format rupiah
  const formatRp = (num: number) =>
    `Rp ${num.toLocaleString("id-ID", { minimumFractionDigits: 0 })}`;

  // Kalkulasi total dinamis
  const subtotal = sections
    .flatMap((s) => s.items)
    .reduce((acc, i) => acc + i.price * i.qty, 0);

  const discountAmount =
    discountType === "percent"
      ? subtotal * (discountValue / 100)
      : discountValue;
  const grandTotal = subtotal - discountAmount;


  const getNextLetter = (index: number) => String.fromCharCode(65 + index) + ".";

  const addSection = () => {
    const letter = getNextLetter(sections.length);
    const title = prompt(`Masukkan nama section (contoh: ${letter} Material & Labour):`);
    if (!title) return;

    const newSection = {
      title,
      type: "item",
      items: [{ name: "", qty: 1, unit: "Unit", price: 0 }],
      details: [],
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    if (confirm("Hapus section ini?")) setSections(sections.filter((_, i) => i !== index));
  };

  const updateSectionTitle = (index: number, value: string) => {
    const updated = [...sections];
    updated[index].title = value;
    setSections(updated);
  };

  // === Item ===
  const addItem = (si: number) => {
    const updated = [...sections];
    updated[si].items.push({ name: "", qty: 1, unit: "Unit", price: 0 });
    setSections(updated);
  };

  const updateItem = (si: number, ii: number, field: string, value: any) => {
    const updated = [...sections];
    updated[si].items[ii][field] =
      field === "qty" || field === "price" ? Number(value) || 0 : value;
    setSections(updated);
  };

  const removeItem = (si: number, ii: number) => {
    const updated = [...sections];
    updated[si].items.splice(ii, 1);
    setSections(updated);
  };

  // === Rincian ===
  const addDetail = (si: number) => {
    const updated = [...sections];
    updated[si].details.push("");
    setSections(updated);
  };

  const updateDetail = (si: number, di: number, value: string) => {
    const updated = [...sections];
    updated[si].details[di] = value;
    setSections(updated);
  };

  const removeDetail = (si: number, di: number) => {
    const updated = [...sections];
    updated[si].details.splice(di, 1);
    setSections(updated);
  };

  // === Catatan ===
  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote]);
      setNewNote("");
    }
  };

  const removeNote = (i: number) => setNotes(notes.filter((_, idx) => idx !== i));

  const handlePreview = () => {
    if (!client || !project) {
      alert("Isi Client dan Project dulu.");
      return;
    }
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold mb-6 text-gray-800">📄 {(id !== "new") ? "Update Quotation" : "Tambah Quotation Baru" }</h1>


        {/* === Header === */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attn (Nama)</label>
            <input
              value={attnName}
              onChange={(e) => setAttnName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Posisi / Dept.</label>
            <input
              value={attnPosition}
              onChange={(e) => setAttnPosition(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Perusahaan
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* === Section === */}
        <div className="space-y-8 mb-8">
          {sections.map((section, si) => (
            <div key={si} className="border rounded-lg bg-gray-50 p-5 relative">
              <div className="flex justify-between items-center mb-3">
                <input
                  value={section.title}
                  onChange={(e) => updateSectionTitle(si, e.target.value)}
                  className="font-semibold text-sm bg-white border rounded px-2 py-1"
                />
                <button
                  onClick={() => removeSection(si)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Hapus Section
                </button>
              </div>

             {section.items.map((item: any, ii: number) => (
              <div
                key={ii}
                className="grid grid-cols-[1fr_70px_80px_150px_150px_60px] gap-2 mb-2 items-center"
              >
                {/* Nama Barang */}
                <input
                  value={item.name}
                  onChange={(e) => updateItem(si, ii, "name", e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm"
                  placeholder="Nama Barang / Pekerjaan"
                />

                {/* Qty */}
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateItem(si, ii, "qty", e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm text-right"
                  placeholder="Qty"
                />

                {/* Unit */}
                <input
                  value={item.unit}
                  onChange={(e) => updateItem(si, ii, "unit", e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm text-center"
                  placeholder="Unit"
                />

                {/* Harga Satuan */}
                <input
                  value={item.price ? `Rp ${item.price.toLocaleString("id-ID")}` : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    const num = Number(raw) || 0;
                    updateItem(si, ii, "price", num);
                  }}
                  onBlur={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    const num = Number(raw) || 0;
                    updateItem(si, ii, "price", num);
                  }}
                  className="border rounded-md px-2 py-1 text-sm text-right"
                  placeholder="Rp 0"
                />

                {/* 💰 Total per Item */}
                <div className="text-right text-sm font-medium text-gray-800 bg-[#fafafa] rounded-md px-2 py-[6px] border border-gray-200">
                  Rp{" "}
                  {((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString(
                    "id-ID"
                  )}
                </div>

                {/* Tombol Hapus */}
                <button
                  onClick={() => removeItem(si, ii)}
                  className="text-xs text-red-500 hover:underline text-right"
                >
                  Hapus
                </button>
              </div>
            ))}

              <button
                onClick={() => addItem(si)}
                className="text-sm text-[#c4a73e] hover:underline"
              >
                + Tambah Item
              </button>

              {/* === Tambah Rincian hanya kalau sudah ada item === */}
              {Array.isArray(section.details) && (
                <div className="mt-4">
                  {section.details.map((detail: any, di: number) => (
                    <div key={di} className="flex items-center gap-2 mb-2">
                      <span className="w-6 text-right text-sm">{di + 1}.</span>
                      <input
                        value={typeof detail === "string" ? detail : detail.description || ""}
                        onChange={(e) => updateDetail(si, di, e.target.value)}
                        className="flex-1 border rounded-md px-2 py-1 text-sm"
                        placeholder="Isi rincian pekerjaan..."
                      />
                      <button
                        onClick={() => removeDetail(si, di)}
                        className="text-xs text-red-500"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addDetail(si)}
                    className="text-sm text-[#c4a73e] hover:underline"
                  >
                    + Tambah Rincian
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addSection}
            className="w-full border-2 border-dashed border-[#c4a73e] py-3 rounded-lg text-[#c4a73e] hover:bg-[#fffaf0] font-medium"
          >
            + Tambah Section
          </button>
        </div>


        {/* Diskon Section */}
        <div className="flex items-center justify-end gap-3 mb-3 text-sm">
          <label className="text-gray-700">Diskon:</label>

          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percent" | "amount")}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="percent">%</option>
            <option value="amount">Rp</option>
          </select>

         <input
            type="text"
            value={
              discountType === "percent"
                ? discountInput
                : discountValue
                  ? `Rp ${discountValue.toLocaleString("id-ID")}`
                  : ""
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value;

              if (discountType === "percent") {
                // izinkan angka dan satu titik desimal
                const clean = val.replace(/[^0-9.]/g, "");
                const fixed = clean.replace(/(\..*)\./g, "$1");
                if (/^\d*\.?\d*$/.test(fixed)) {
                  setDiscountInput(fixed); // tampilkan di input
                  setDiscountValue(fixed === "" ? 0 : parseFloat(fixed)); // simpan number aslinya
                }
              } else {
                // hanya angka untuk nominal
                const raw = val.replace(/[^0-9]/g, "");
                const num = raw === "" ? 0 : Number(raw);
                setDiscountValue(num);
                setDiscountInput(num ? `Rp ${num.toLocaleString("id-ID")}` : "");
              }
            }}
            onBlur={() => {
              // sinkronkan tampilan percent saat keluar dari input
              if (discountType === "percent") {
                setDiscountInput(
                  discountValue === 0 ? "" : String(discountValue)
                );
              }
            }}
            className="w-32 border rounded-md px-2 py-1 text-right text-sm"
            placeholder={discountType === "percent" ? "0" : "Rp 0"}
          />       
        </div>
        <div className="text-right text-sm mt-1 mb-5">
          <p>Subtotal: <span className="font-medium">{`Rp ${subtotal.toLocaleString("id-ID")}`}</span></p>
          <p>Diskon: <span className="font-medium text-red-500">{discountType === "percent" ? `${discountValue}%` : `Rp ${discountAmount.toLocaleString("id-ID")}`}</span></p>
          {/* 💡 Tambahan baru — tampilkan diskon amount meskipun user pakai persen */}
            {discountType === "percent" && discountValue > 0 && (
              <p className="text-gray-600">
                (Diskon Amount: Rp {discountAmount.toLocaleString("id-ID")})
              </p>
            )}
          <p className="font-semibold text-[#b6972a] text-base mt-2">Total: Rp {grandTotal.toLocaleString("id-ID")}</p>
        </div>

        {/* === Catatan === */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
          <div className="flex gap-2 mb-3">
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Tambah catatan baru..."
              className="flex-1 border rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={addNote}
              className="px-4 py-2 bg-[#c4a73e] text-white text-sm rounded-md hover:bg-[#b6972a]"
            >
              Tambah
            </button>
          </div>

          {notes.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {notes.map((n, i) => (
                <li key={i} className="flex justify-between">
                  <span>{n}</span>
                  <button
                    onClick={() => removeNote(i)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">Belum ada catatan</p>
          )}
        </div>

        <button
          onClick={handlePreview}
          className="w-full bg-[#c4a73e] text-white py-2 rounded-md font-medium hover:bg-[#b6972a]"
        >
          Lihat Preview
        </button>
      </div>

      {/* === Preview === */}
      {showPreview && (
        <div className="mt-10">
          <QuotationTemplate
            client={client}
            project={project}
            date={new Date().toISOString()}
            attnName={attnName}
            attnPosition={attnPosition}
            address={address}
            sections={sections}
            notes={notes}
            discount={{type: discountType,
                        value: discountValue,}}
            mode={isAdd ? "add" : "edit"}
            quotationId={!isAdd && id ? String(id) : undefined}
            quotationNo={quotationNo}
          />
        </div>
      )}

     
    </div>
  );
}