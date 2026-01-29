import { X, Calendar, Activity, AlertCircle } from "lucide-react";

interface CederaDetail {
  lokasi: string;
  jenis: string;
  mekanisme: string;
}

export interface LaporanData {
  id: string;
  namaAtlet: string;
  jenisKelamin: string;
  usia: number;
  tanggalKejadian: string;
  jenisAktivitas: string;
  konteks: string;
  cederaDetails: CederaDetail[];
  kemampuanGerak: string;
  tingkatNyeri: string;
  redFlags: string[];
  severityLevel?: string; // Pre-calculated severity from database: 'ringan', 'sedang', or 'berat'
  pelapor?: {
    nama: string;
    wilayah: string;
  };
  status?: string;
  tanggalLapor?: string;
  tanggalVerifikasi?: string;
  verifikator?: string;
}

interface ModalRingkasanDataProps {
  isOpen: boolean;
  onClose: () => void;
  data: LaporanData;
}

export function ModalRingkasanData({ isOpen, onClose, data }: ModalRingkasanDataProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Ringkasan Data Lengkap</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              title="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Kejadian Section */}
          <div>
            <h3 className="flex items-center gap-2 mb-4 text-gray-500">
              <Calendar className="w-4 h-4" />
              Informasi Kejadian
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nama Atlet:</span>
                <span className="text-sm">{data.namaAtlet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Jenis Kelamin:</span>
                <span className="text-sm">{data.jenisKelamin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usia:</span>
                <span className="text-sm">{data.usia} tahun</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tanggal Kejadian:</span>
                <span className="text-sm">{data.tanggalKejadian}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Jenis Aktivitas:</span>
                <span className="text-sm">{data.jenisAktivitas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Konteks:</span>
                <span className="text-sm">{data.konteks}</span>
              </div>
            </div>
          </div>

          {/* Detail Cedera Section */}
          <div>
            <h3 className="flex items-center gap-2 mb-4 text-gray-500">
              <Activity className="w-4 h-4" />
              Detail Cedera ({data.cederaDetails.length})
            </h3>
            <div className="space-y-4">
              {data.cederaDetails.map((cedera, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm mb-3 text-gray-700">Cedera {index + 1}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Lokasi:</span>
                      <span className="text-sm">{cedera.lokasi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Jenis:</span>
                      <span className="text-sm">{cedera.jenis}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Mekanisme:</span>
                      <span className="text-sm">{cedera.mekanisme}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Penilaian Awal Section */}
          <div>
            <h3 className="flex items-center gap-2 mb-4 text-gray-500">
              <AlertCircle className="w-4 h-4" />
              Penilaian Awal
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Kemampuan Gerak:</span>
                <span className="text-sm">{data.kemampuanGerak}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tingkat Nyeri:</span>
                <span className="text-sm">{data.tingkatNyeri}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">Red Flags:</span>
                <div className="text-right">
                  {data.redFlags.length > 0 ? (
                    data.redFlags.map((flag, index) => (
                      <div key={index} className="text-sm text-red-600">
                        • {flag}
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-green-600">Tidak ada red flags</span>
                  )}
                </div>
              </div>
              {data.severityLevel && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tingkat Keparahan:</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    data.severityLevel === 'ringan'
                      ? 'bg-green-100 text-green-700'
                      : data.severityLevel === 'sedang'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {data.severityLevel.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info Pelapor (optional) */}
          {data.pelapor && (
            <div>
              <h3 className="mb-3 text-gray-500">Informasi Pelapor</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nama Pelapor:</span>
                  <span className="text-sm">{data.pelapor.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Wilayah:</span>
                  <span className="text-sm">{data.pelapor.wilayah}</span>
                </div>
                {data.tanggalLapor && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tanggal Lapor:</span>
                    <span className="text-sm">{data.tanggalLapor}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status & Verifikasi (optional) */}
          {data.status && (
            <div>
              <h3 className="mb-3 text-gray-500">Status Verifikasi</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      data.status === "Terverifikasi"
                        ? "bg-green-100 text-green-700"
                        : data.status === "Menunggu Verifikasi"
                        ? "bg-yellow-100 text-yellow-700"
                        : data.status === "Ditolak"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {data.status}
                  </span>
                </div>
                {data.tanggalVerifikasi && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tanggal Verifikasi:</span>
                    <span className="text-sm">{data.tanggalVerifikasi}</span>
                  </div>
                )}
                {data.verifikator && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Diverifikasi Oleh:</span>
                    <span className="text-sm">{data.verifikator}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
