import { useState, type FormEvent } from "react";
import { api } from "../api";
export default function Contact() {
 const [sent,setSent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const [form,setForm]=useState({name:"",phone:"",neighborhood:"",message:"",website:""});
 const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError("");try{await api("/contact",{method:"POST",body:JSON.stringify(form)});setSent(true)}catch(err){setError(err instanceof Error?err.message:"Envoi impossible. Réessayez.");}finally{setBusy(false)}};
 return <div className="mx-auto max-w-5xl px-5 py-12">
  <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-terracotta">Restons en contact</p><h2 className="text-3xl font-extrabold text-green-darker">Contact & inscription</h2>
  <div className="mt-8 grid gap-6 md:grid-cols-2">
   <form onSubmit={submit} className="rounded-3xl border border-green-dark/10 bg-white p-6 shadow-sm">
    {sent?<div className="py-10 text-center"><div className="text-4xl">✅</div><p className="mt-3 font-bold text-green-dark">Jazakoumoullahou khayran !</p><p className="text-sm text-ink/60">Votre demande a bien été enregistrée. Le bureau pourra vous répondre.</p></div>:<>
     <label aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">Site web<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>setForm({...form,website:e.target.value})}/></label>
     {[["name","Nom complet","text","Ex : Aïcha Ndiaye"],["phone","Téléphone / WhatsApp","tel","+221 77 000 00 00"],["neighborhood","Quartier","text","Ex : Grand Yoff"]].map(([key,label,type,placeholder])=><label key={key} className="mb-4 block"><span className="text-xs font-bold uppercase tracking-widest text-ink/50">{label}</span><input required maxLength={120} type={type} value={form[key as "name"|"phone"|"neighborhood"]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder} className="mt-1 w-full rounded-xl border border-green-dark/15 px-4 py-2.5 text-sm outline-none focus:border-gold"/></label>)}
     <label className="mb-4 block"><span className="text-xs font-bold uppercase tracking-widest text-ink/50">Message</span><textarea required maxLength={3000} rows={4} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="mt-1 w-full rounded-xl border border-green-dark/15 px-4 py-2.5 text-sm outline-none focus:border-gold"/></label>
     {error&&<p role="alert" className="mb-3 text-sm text-terracotta">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-terracotta py-3 font-bold text-white disabled:opacity-50">{busy?"Envoi…":"Envoyer"}</button>
    </>}
   </form>
   <div className="space-y-4">{[["📞","Téléphone","+221 70 777 57 20"],["💬","Groupe WhatsApp","Annonces des ziarras"],["✉️","Email","diagneibeu10@gmail.com"],["📍","Siège","Station Canada , Dakar, Sénégal"]].map(([i,t,v])=><div key={t} className="flex items-start gap-4 rounded-2xl border border-green-dark/10 bg-white p-5"><div className="text-2xl">{i}</div><div><div className="text-xs font-bold uppercase tracking-widest text-ink/45">{t}</div><div className="font-semibold text-green-dark">{v}</div></div></div>)}<div className="islamic-pattern rounded-2xl bg-green-dark p-6 text-center"><div className="arabic text-xl text-gold">جزاكم الله خيرا</div></div></div>
  </div>
 </div>
}
