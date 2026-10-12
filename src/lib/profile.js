import { experience, education, languages, skills } from '@/data/skills';
import { projects } from '@/data/projects';

/**
 * Sohbet asistanına verilen özgeçmiş bilgileri. Hakkımda ve Projeler
 * sayfalarıyla aynı veriden üretilir; sayfadaki bilgi değişince asistanın
 * bildikleri de kendiliğinden güncellenir.
 */
export function profileFacts() {
  const lines = [
    ...experience.map(
      item => `- ${item.period.tr}: ${item.company}, ${item.title.tr}. ${item.description.tr}`
    ),
    ...education.map(
      item => `- Eğitim (${item.period.tr}): ${item.institution.tr}, ${item.unit.tr}, ${item.degree.tr} bölümü`
    ),
    `- Diller: ${languages
      .map(item => `${item.name.tr} (${item.level.tr.toLocaleLowerCase('tr')})`)
      .join(', ')}`,
    `- Yetkinlikler: ${skills.map(item => item.name.tr).join(', ')}`,
    ...projects.map(item => `- Proje: ${item.title.tr}. ${item.description.tr}`)
  ];

  return lines.join('\n');
}
