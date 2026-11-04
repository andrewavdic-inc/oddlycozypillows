import React, { useState } from 'react';
import { Upload, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { uploadImageFile } from '../../../services/firebaseClient';

export default function CustomProofsTab() {
  const { customProofs, updateCustomProof } = useStore();
  const [uploadingId, setUploadingId] = useState(null);

  const handleUploadMockupButton = async (proofId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(proofId);
    try {
      const url = await uploadImageFile(file, 'proofs');
      updateCustomProof(proofId, {
        mockupProofImage: url,
        status: 'Proof Sent',
      });
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Bespoke Custom Order Proofing Desk</h2>
        <p className="text-sm text-slate-600">
          Review customer custom requests, upload your prepared mockup image with a button, and mark approved for production.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {customProofs.map((proof) => (
          <div
            key={proof.id}
            className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display text-lg font-bold">{proof.id}</span>
                <span className="ml-2 text-xs font-bold text-slate-500">{proof.createdAt}</span>
                <p className="text-xs font-extrabold text-indigo-600">{proof.customerEmail}</p>
              </div>
              <select
                value={proof.status}
                onChange={(e) => updateCustomProof(proof.id, { status: e.target.value })}
                className="px-3 py-1.5 rounded-full text-xs font-extrabold border-2 border-slate-900 bg-amber-200"
              >
                <option value="Needs Mockup">Needs Mockup</option>
                <option value="Proof Sent">Proof Sent to Customer</option>
                <option value="Approved">Approved for Printify</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="font-extrabold text-slate-700">
                Item: Custom {proof.itemType} — {proof.sizeLabel} (${proof.price})
              </p>
              <p className="text-slate-600 italic">"{proof.description}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                  Customer Reference
                </span>
                <img
                  src={proof.referenceImage}
                  alt="Customer Reference"
                  className="w-28 h-28 mx-auto rounded-2xl object-cover border-2 border-slate-900 bg-slate-100"
                />
              </div>

              <div className="text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                  Your Prepared Mockup Proof
                </span>
                {proof.mockupProofImage ? (
                  <img
                    src={proof.mockupProofImage}
                    alt="Prepared Mockup"
                    className="w-28 h-28 mx-auto rounded-2xl object-cover border-2 border-emerald-600 bg-slate-100 mb-2"
                  />
                ) : (
                  <div className="w-28 h-28 mx-auto rounded-2xl border-2 border-dashed border-slate-400 flex items-center justify-center text-xs text-slate-400 mb-2">
                    <Clock className="w-6 h-6" />
                  </div>
                )}

                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6A4C93] hover:bg-purple-800 text-white font-extrabold text-xs cursor-pointer border-2 border-slate-900 shadow">
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {uploadingId === proof.id ? 'Uploading...' : 'Upload Mockup Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadMockupButton(proof.id, e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
