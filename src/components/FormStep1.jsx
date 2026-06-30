import React from 'react';

export default function FormStep1({ formData, setFormData, onNext }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const isComplete = formData.email && formData.acceptedGuidelines;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-50/50 border-l-4 border-[#0A1C5C] p-6 rounded-2xl">
        <h2 className="text-xl font-black text-[#0A1C5C] mb-4 tracking-tight">Publicity & Promotions Request Form</h2>
        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-4">Read carefully before starting:</p>
        <ul className="text-sm text-slate-600 space-y-3 list-none">
          {[
            'Submit at least three (3) working days before the event.',
            'Ensure all materials (Press Release, Photos) are attached.',
            'Incomplete or late submissions may not be accommodated.',
            'All content must align with AdZU’s values and brand identity.',
            'UCO reserves the right to decline non-compliant requests.'
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-[#0A1C5C] font-bold">•</span>
              <span className="leading-relaxed font-medium">{text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 p-4 bg-amber-50/80 border border-amber-100 rounded-2xl">
          <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Important Note:</p>
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            Submitting this form does not guarantee approval. All submissions are subject to UCO review and scheduling.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-widest">Email Address*</label>
          <input 
            type="email" 
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="your-email@adzu.edu.ph"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium"
            required
          />
          <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Your account details will be recorded for file tracking.</p>
        </div>

        <div className="group flex items-start gap-4 p-5 bg-slate-50/50 rounded-2xl border-2 border-slate-100 hover:border-indigo-100 transition-colors cursor-pointer" onClick={() => handleChange({ target: { name: 'acceptedGuidelines', type: 'checkbox', checked: !formData.acceptedGuidelines } })}>
          <div className="mt-0.5">
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.acceptedGuidelines ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}>
              {formData.acceptedGuidelines && <span className="text-white text-[10px] font-black">✓</span>}
            </div>
          </div>
          <label className="text-xs text-slate-500 leading-relaxed font-semibold cursor-pointer select-none">
            I have read and understood the guidelines. I acknowledge that all submissions are subject to UCO review and I am responsible for confirming the status.
          </label>
        </div>
      </div>

      <div className="pt-6">
        <button 
          onClick={onNext} 
          disabled={!isComplete}
          className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${isComplete ? 'bg-[#0A1C5C] text-white hover:bg-indigo-700 hover:-translate-y-1 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
        >
          Confirm and Start Request
        </button>
      </div>
    </div>
  );
}
