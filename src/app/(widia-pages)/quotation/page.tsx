"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "@/lib/axiosClient";
import { Loader2, Eye, Edit3 } from "lucide-react";

interface QuotationSummary {
  id: number;
  quotation_no: string;
  client_name: string;
  project: string;
  total: number;
  created_at: string;
}

export default function QuotationListPage() {
  const [data, setData] = useState<QuotationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = async () => {
    try {
      const res = await axiosClient.get("/quotation-list", { withCredentials: true });
      setData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching quotations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const formatRp = (num: number) =>
    `Rp ${num.toLocaleString("id-ID", { minimumFractionDigits: 0 })}`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            📄 Daftar Quotation
          </h1>
          <Link
            href="/quotation/new"
            className="bg-[#c4a73e] hover:bg-[#b6972a] text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all"
          >
            + Buat Quotation
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#c4a73e]" size={40} />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            Belum ada quotation yang tersimpan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="border p-3 w-12 text-center">No</th>
                  <th className="border p-3 text-left">Quotation No</th>
                  <th className="border p-3 text-left">Client</th>
                  <th className="border p-3 text-left">Project</th>
                  <th className="border p-3 text-right">Total</th>
                  <th className="border p-3 text-center">Tanggal</th>
                  <th className="border p-3 text-center w-40">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((q, index) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition">
                    <td className="border p-3 text-center">{index + 1}</td>
                    <td className="border p-3 font-medium text-gray-800">{q.quotation_no}</td>
                    <td className="border p-3">{q.client_name}</td>
                    <td className="border p-3">{q.project}</td>
                    <td className="border p-3 text-right">{formatRp(q.total)}</td>
                    <td className="border p-3 text-center text-gray-600">
                      {formatDate(q.created_at)}
                    </td>
                    <td className="border p-3 text-center">
                      <div className="flex justify-center gap-3">
                        <Link
                          href={`/quotation/${q.id}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Edit3 size={16} /> Edit
                        </Link>
                        {/* <Link
                          href={`/quotation/preview/${q.id}`}
                          className="text-[#c4a73e] hover:text-[#b6972a] flex items-center gap-1"
                        >
                          <Eye size={16} /> View
                        </Link> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}