export interface MentirosoDAO {
  id              : number,
  nombre_completo : string,
  alias           : string,
  slug            : string,
  retrato_s3_key  : string
}

// Threat level midnight boyyys
// TODO: this data structure has to be used on order to compute the length of the Pinnochio nose
const THREAT_LEVELS = {
    "Un santo":             1,
    "Mentirosete":          2,
    "Jaimito":              3,
    "Jeta":                 4,
    "Jetoncio":             5,
    "Bart Simpson":         6,
    "Espía Ruso":           10,
    "Miente por profesión": 15,
    "Miente por placer":    20,
    "Silvio Pedrusconi":    25,
    "Villano":              30
}

export async function computeThreatLevel(mentiroso_no_mentiras: number) {
    for (const [label, no_mentiras_threshold] of Object.entries(THREAT_LEVELS).reverse()) {        
      if (mentiroso_no_mentiras >= no_mentiras_threshold) {
            return label
        }
    }
}

export function renderAliasText(alias: string, leading_comma = true) {
  if (alias == null) {
    return ""
  }
  let alias_text = "alias "
  if (leading_comma) {
    alias_text = ", " + alias_text
  }
  return <>
    { alias_text }
    <span className="italic">{alias}</span>
  </>
}
