import React from 'react';

const socialAccounts = ['Facebook', 'Twitter', 'Instagram', 'YouTube', 'TikTok'];
const serviceOptions = [
  'Posting by Official AdZU Social Media Accounts (Text, photos, and videos)',
  'Layout/Design and Posting of graphics (Social cards and infographics)',
  'Other'
];

export default function FormStep3({ formData, setFormData, onNext, onPrev }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      requestDetails: {
        ...formData.requestDetails,
        [name]: value
      }
    });
  };

  const details = formData.requestDetails || {};
  const toggleArrayValue = (name, value) => {
    const current = Array.isArray(details[name]) ? details[name] : (details[name] ? [details[name]] : []);
    const newValues = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    handleChange({ target: { name, value: newValues } });
  };

  const isSelected = (name, value) => {
    const current = Array.isArray(details[name]) ? details[name] : (details[name] ? [details[name]] : []);
    return current.includes(value);
  };

  const isComplete = details.office_name && details.requestedByName && details.requestedByMobile && 
                     (details.socialAccount && details.socialAccount.length > 0) && 
                     (details.serviceType && details.serviceType.length > 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Request Details</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Specifics for {formData.requestType}*</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-[0.15em]">Requesting Office / Unit*</label>
          <input 
            type="text" 
            name="office_name"
            value={details.office_name || ''}
            onChange={handleChange}
            placeholder="e.g. Office of Student Affairs"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium"
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-[0.15em]">Requested by (Full Name)*</label>
              <input 
                type="text" 
                name="requestedByName"
                value={details.requestedByName || ''}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-[0.15em]">Requested by (Mobile No.)*</label>
              <input 
                type="text" 
                name="requestedByMobile"
                value={details.requestedByMobile || ''}
                onChange={handleChange}
                placeholder="09XX-XXX-XXXX"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-[0.15em]">Alternate Contact (Full Name)</label>
              <input 
                type="text" 
                name="alternateContactName"
                value={details.alternateContactName || ''}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-[0.15em]">Alternate Contact (Mobile No.)</label>
              <input 
                type="text" 
                name="alternateContactMobile"
                value={details.alternateContactMobile || ''}
                onChange={handleChange}
                placeholder="09XX-XXX-XXXX"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-[0.15em]">Social Media Platform*</label>
          <div className="flex flex-wrap gap-2">
            {socialAccounts.map(account => (
              <button
                key={account}
                onClick={() => toggleArrayValue('socialAccount', account)}
                className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 transition-all ${isSelected('socialAccount', account) ? 'bg-[#0A1C5C] border-[#0A1C5C] text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'}`}
              >
                {account}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-[0.15em]">Specific Service Required*</label>
          <div className="space-y-3">
            {serviceOptions.map(option => (
              <button
                key={option}
                onClick={() => toggleArrayValue('serviceType', option)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${isSelected('serviceType', option) ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200'}`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected('serviceType', option) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}>
                  {isSelected('serviceType', option) && <span className="text-white text-[10px] leading-none">✓</span>}
                </div>
                <span className={`text-xs font-bold leading-relaxed ${isSelected('serviceType', option) ? 'text-indigo-900' : 'text-slate-600'}`}>{option}</span>
              </button>
            ))}
            {isSelected('serviceType', 'Other') && (
              <input 
                type="text" 
                name="otherService"
                value={details.otherService || ''}
                onChange={handleChange}
                placeholder="Please describe your specific requirement..."
                className="w-full p-4 mt-2 bg-white border-2 border-indigo-200 focus:border-indigo-500 outline-none transition-all text-sm font-medium animate-in fade-in"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button 
          onClick={onPrev}
          className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
        >
          Back
        </button>
        <button 
          onClick={onNext} 
          disabled={!isComplete}
          className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${isComplete ? 'bg-[#0A1C5C] text-white hover:bg-indigo-700 hover:-translate-y-1 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
