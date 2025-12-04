import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Download, Save, RefreshCw, FileSpreadsheet, X } from 'lucide-react';
import { School, Event, AppState } from '../types';
import { read, utils } from 'xlsx';

interface DataUploadProps {
  schools: School[];
  events: Event[];
  onUpload: (
    eventId: string, 
    data: string, 
    dataType: 'Attendance' | 'Submission'
  ) => void;
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onRestore: (data: AppState) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({ schools, events, onUpload, onAddEvent, onRestore }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [inputType, setInputType] = useState<'Attendance' | 'Submission'>('Attendance');
  const [rawData, setRawData] = useState('');
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Event State
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Socialization' as const,
    weight: 10,
    description: ''
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent(newEvent);
    // Reset form
    setNewEvent({
       name: '',
      date: new Date().toISOString().split('T')[0],
      type: 'Socialization',
      weight: 10,
      description: ''
    });
    alert("Kegiatan berhasil dibuat! Anda sekarang dapat mengupload data.");
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer);
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const sheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      // Smart detection: Find column with 'NPSN' or just take the first column if not found
      let npsnIndex = 0;
      let startRow = 0; // If header found, start from row 1

      if (jsonData.length > 0) {
        const headerRow = jsonData[0];
        const foundIndex = headerRow.findIndex((cell: any) => 
          cell && cell.toString().toLowerCase().includes('npsn')
        );
        
        if (foundIndex !== -1) {
          npsnIndex = foundIndex;
          startRow = 1;
        }
      }

      // Extract data
      const extractedData = jsonData
        .slice(startRow)
        .map(row => row[npsnIndex])
        .filter(val => val !== undefined && val !== null && val !== '')
        .map(val => val.toString().trim());

      if (extractedData.length === 0) {
        alert("Tidak ada data yang ditemukan di file Excel.");
        setFileName('');
        setRawData('');
      } else {
        setRawData(extractedData.join('\n'));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal membaca file Excel. Pastikan format valid (.xlsx atau .xls).");
      setFileName('');
      setRawData('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessUpload = () => {
    if (!selectedEventId || !rawData) return;
    
    setIsProcessing(true);
    setUploadStatus('idle');

    // Simulate processing delay for "UX"
    setTimeout(() => {
      try {
        onUpload(selectedEventId, rawData, inputType);
        setUploadStatus('success');
        setStep(3);
      } catch (err) {
        setUploadStatus('error');
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  // --- Backup & Restore Logic ---
  const handleBackup = () => {
    const data: AppState = { schools, events };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-simonev-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.schools && json.events) {
          onRestore(json);
          alert('Data berhasil dipulihkan!');
        } else {
          alert('Format file tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file backup.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = ''; 
  };

  return (
    <div className="space-y-8">
      {/* Backup & Restore Section */}
      <div className="bg-[#162660] text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
            <Save size={20} className="text-[#F1E4D1]" />
            Penyimpanan Data (Cloud)
          </h3>
          <p className="text-blue-200 text-sm max-w-xl">
            Agar data tersimpan aman tanpa server, unduh backup data secara berkala dan simpan ke <strong>Google Drive</strong> anda. Upload kembali file tersebut di sini untuk memulihkan data.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleBackup}
            className="flex items-center gap-2 px-4 py-2 bg-[#F1E4D1] text-[#162660] rounded-lg font-bold hover:bg-white transition"
          >
            <Download size={18} />
            Download Backup
          </button>
          <button 
            onClick={handleRestoreClick}
            className="flex items-center gap-2 px-4 py-2 border border-blue-400 bg-blue-900 bg-opacity-50 text-white rounded-lg font-medium hover:bg-blue-800 transition"
          >
            <RefreshCw size={18} />
            Restore Data
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Event */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-[#162660] mb-4 border-b pb-2">1. Buat Kegiatan Baru</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kegiatan</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-[#162660] text-slate-900 bg-white"
                  placeholder="Ex: Sosialisasi Kurikulum Merdeka"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    required
                    className="w-full rounded-lg border-slate-300 border p-2 text-sm text-slate-900 bg-white"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bobot Poin</label>
                  <input 
                    type="number" 
                    className="w-full rounded-lg border-slate-300 border p-2 text-sm text-slate-900 bg-white"
                    value={newEvent.weight}
                    onChange={(e) => setNewEvent({...newEvent, weight: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Kegiatan</label>
                <select 
                  className="w-full rounded-lg border-slate-300 border p-2 text-sm text-slate-900 bg-white"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                >
                  <option value="Socialization">Sosialisasi (Absensi)</option>
                  <option value="DataRequest">Permintaan Data</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-[#162660] text-white py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition">
                Buat Event
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Upload Flow */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
            <h3 className="text-lg font-bold text-[#162660] mb-4 border-b pb-2">2. Upload Data Keikutsertaan</h3>

            {/* Stepper */}
            <div className="flex items-center mb-8">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-[#162660] text-white' : 'bg-slate-200 text-slate-500'} font-bold text-sm`}>1</div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#162660]' : 'bg-slate-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-[#162660] text-white' : 'bg-slate-200 text-slate-500'} font-bold text-sm`}>2</div>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-[#162660]' : 'bg-slate-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-[#162660] text-white' : 'bg-slate-200 text-slate-500'} font-bold text-sm`}>3</div>
            </div>

            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Kegiatan</label>
                    <select 
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#162660] text-slate-900 bg-white"
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                      <option value="">-- Pilih Kegiatan --</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>{ev.name} ({ev.date})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Data</label>
                    <div className="flex gap-2">
                      <button 
                        className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition ${inputType === 'Attendance' ? 'bg-[#D0E6FD] border-[#162660] text-[#162660]' : 'border-slate-200 hover:bg-slate-50'}`}
                        onClick={() => setInputType('Attendance')}
                      >
                        Absensi
                      </button>
                      <button 
                        className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition ${inputType === 'Submission' ? 'bg-[#D0E6FD] border-[#162660] text-[#162660]' : 'border-slate-200 hover:bg-slate-50'}`}
                        onClick={() => setInputType('Submission')}
                      >
                        Pengumpulan
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    disabled={!selectedEventId}
                    onClick={() => setStep(2)}
                    className="bg-[#162660] text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition"
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-[#D0E6FD] bg-opacity-30 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-[#162660] mb-2 font-medium">Instruksi Upload Excel:</p>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    <li>Gunakan file Excel (<strong>.xlsx</strong> atau <strong>.xls</strong>).</li>
                    <li>Pastikan ada kolom dengan header <strong>"NPSN"</strong>.</li>
                    <li>Jika tidak ada header, sistem akan membaca kolom pertama sebagai NPSN.</li>
                  </ul>
                </div>

                {!fileName ? (
                  <div className="relative">
                    <input 
                      type="file" 
                      id="excel-upload"
                      accept=".xlsx, .xls"
                      onChange={handleExcelUpload}
                      className="hidden" 
                    />
                    <label 
                      htmlFor="excel-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileSpreadsheet className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="mb-2 text-sm text-slate-700 font-semibold">Klik untuk upload file Excel</p>
                        <p className="text-xs text-slate-500">.XLSX atau .XLS</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FileSpreadsheet className="text-green-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{fileName}</p>
                        <p className="text-xs text-slate-500">
                          {rawData ? `${rawData.split('\n').length} baris data ditemukan` : 'Memproses...'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setFileName('');
                        setRawData('');
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <button onClick={() => setStep(1)} className="text-slate-500 font-medium text-sm hover:text-slate-800">
                    Kembali
                  </button>
                  <button 
                    onClick={handleProcessUpload}
                    disabled={isProcessing || !rawData}
                    className="bg-[#162660] text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Upload size={18} />
                        Proses Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-12 animate-fadeIn">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-xl font-bold text-[#162660] mb-2">Data Berhasil Disimpan!</h4>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Skor partisipasi sekolah telah diperbarui berdasarkan data dari file Excel.
                </p>
                <div className="flex justify-center gap-4">
                   <button 
                    onClick={() => {
                      setStep(1);
                      setRawData('');
                      setFileName('');
                      setSelectedEventId('');
                    }}
                    className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50"
                  >
                    Upload Lagi
                  </button>
                  <button 
                    onClick={() => window.location.hash = ''} // Simple nav 
                    className="px-6 py-2 bg-[#162660] rounded-lg text-white font-medium hover:bg-opacity-90"
                  >
                    Lihat Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;