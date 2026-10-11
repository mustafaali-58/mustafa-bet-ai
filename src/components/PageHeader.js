// İç sayfaların ortak başlık bandı: sayfa başlığı ve isteğe bağlı kısa açıklama.
export default function PageHeader({ title, lead, children }) {
  return (
    <header className="page-header">
      <div className="container">
        <h1 className="page-title">{title}</h1>
        {lead && <p className="page-lead">{lead}</p>}
        {children}
      </div>
    </header>
  );
}
