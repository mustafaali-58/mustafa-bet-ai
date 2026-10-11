// Yapılandırılmış veriyi (JSON-LD) sayfaya ekler. `<` karakteri, verinin
// içinden HTML etiketi enjekte edilememesi için kaçışlanır.
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c')
      }}
    />
  );
}
