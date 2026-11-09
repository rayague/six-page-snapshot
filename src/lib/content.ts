// Contenus éditoriaux. Les montants et délais susceptibles d'évoluer sont marqués « à vérifier ».
export const programmes = [
  { titre: "Licence", niveau: "Licence", duree: "3 ans · 180 ECTS", domaine: "Tous domaines", texte: "Premier cycle universitaire, accessible après le baccalauréat ou un diplôme équivalent." },
  { titre: "Master", niveau: "Master", duree: "2 ans · 120 ECTS", domaine: "Tous domaines", texte: "Deuxième cycle, spécialisation disciplinaire ou professionnelle." },
  { titre: "Doctorat", niveau: "Doctorat", duree: "3 ans en moyenne", domaine: "Recherche", texte: "Troisième cycle au sein d'une école doctorale, souvent sous contrat doctoral." },
  { titre: "BUT", niveau: "Licence", duree: "3 ans · 180 ECTS", domaine: "Technologie", texte: "Bachelor universitaire de technologie, préparé en IUT." },
  { titre: "Diplôme d'ingénieur", niveau: "Écoles", duree: "5 ans (bac+5)", domaine: "Ingénierie", texte: "Délivré par les écoles accréditées par la Commission des titres d'ingénieur (CTI)." },
  { titre: "Programme Grande École", niveau: "Écoles", duree: "Grade de master", domaine: "Commerce", texte: "Cursus phare des écoles de management, souvent visé par l'État." },
  { titre: "Diplôme d'architecte", niveau: "Écoles", duree: "5 ans (DEA)", domaine: "Arts & architecture", texte: "Préparé dans les écoles nationales supérieures d'architecture (ENSA)." },
  { titre: "Master of Science", niveau: "Master", duree: "1 à 2 ans", domaine: "Commerce", texte: "Programmes spécialisés, souvent enseignés en anglais." },
];

export const universites = [
  { nom: "Université Paris-Saclay", ville: "Gif-sur-Yvette", specialites: ["Physique", "Mathématiques", "Médecine"], classement: "ARWU 2024 : 12e" },
  { nom: "Université PSL", ville: "Paris", specialites: ["Sciences", "Lettres", "Économie"], classement: "ARWU 2024 : 33e" },
  { nom: "Sorbonne Université", ville: "Paris", specialites: ["Lettres", "Médecine", "Sciences"], classement: "ARWU 2024 : 43e" },
  { nom: "Université Paris Cité", ville: "Paris", specialites: ["Santé", "Sciences humaines", "Physique"], classement: "ARWU 2024 : top 100" },
  { nom: "Université Grenoble Alpes", ville: "Grenoble", specialites: ["Ingénierie", "Géosciences", "Informatique"], classement: "ARWU 2024 : top 150" },
  { nom: "Aix-Marseille Université", ville: "Marseille", specialites: ["Océanographie", "Droit", "Santé"], classement: "ARWU 2024 : top 200" },
  { nom: "Université de Strasbourg", ville: "Strasbourg", specialites: ["Chimie", "Biologie", "Droit européen"], classement: "ARWU 2024 : top 200" },
  { nom: "Université Claude Bernard Lyon 1", ville: "Lyon", specialites: ["Santé", "Sciences", "Sport"], classement: "ARWU 2024 : top 300" },
  { nom: "Université de Montpellier", ville: "Montpellier", specialites: ["Écologie", "Agronomie", "Médecine"], classement: "ARWU 2024 : top 200" },
  { nom: "Université de Bordeaux", ville: "Bordeaux", specialites: ["Neurosciences", "Œnologie", "Lasers"], classement: "ARWU 2024 : top 300" },
  { nom: "Université Toulouse III", ville: "Toulouse", specialites: ["Aéronautique", "Santé", "Astrophysique"], classement: "ARWU 2024 : top 400" },
  { nom: "Université de Lille", ville: "Lille", specialites: ["Santé", "Droit", "Ingénierie"], classement: "ARWU 2024 : top 400" },
];

export const etapes = [
  { n: "01", titre: "Candidater via « Études en France »", quand: "Octobre → printemps de l'année d'entrée",
    texte: "Si vous résidez dans l'un des pays concernés par la procédure (plus de 70 pays — liste à vérifier), votre candidature et votre demande de visa passent par la plateforme Études en France, gérée par Campus France, avec un entretien pédagogique.",
    source: "campusfrance.org", url: "https://www.campusfrance.org/fr/procedure-etudes-en-france" },
  { n: "02", titre: "Demander le visa long séjour étudiant (VLS-TS)", quand: "Après l'acceptation",
    texte: "La demande se fait en ligne sur France-Visas puis au consulat ou au prestataire. Le VLS-TS « étudiant » vaut titre de séjour pour sa durée de validité (en général un an). Frais de visa : 50 € (à vérifier).",
    source: "france-visas.gouv.fr", url: "https://france-visas.gouv.fr" },
  { n: "03", titre: "Valider le visa en ligne à l'arrivée", quand: "Dans les 3 mois après l'arrivée",
    texte: "La validation se fait sur le site de l'ANEF (administration-etrangers-en-france.interieur.gouv.fr) avec paiement d'une taxe en timbre électronique (50 € pour les étudiants — à vérifier). Sans validation, vous êtes en situation irrégulière.",
    source: "service-public.fr", url: "https://www.service-public.fr/particuliers/vosdroits/F39" },
  { n: "04", titre: "Payer la CVEC", quand: "Avant l'inscription administrative",
    texte: "La Contribution de vie étudiante et de campus se règle sur cvec.etudiant.gouv.fr. Montant 2025-2026 : 105 € (à vérifier, révisé chaque année). Les boursiers et réfugiés en sont exonérés.",
    source: "cvec.etudiant.gouv.fr", url: "https://cvec.etudiant.gouv.fr" },
  { n: "05", titre: "S'affilier à la sécurité sociale", quand: "Après l'inscription",
    texte: "L'affiliation à l'Assurance Maladie est gratuite et se fait sur etudiant-ameli.fr. Une mutuelle complémentaire reste facultative ; la Complémentaire santé solidaire peut être demandée sous conditions.",
    source: "etudiant-ameli.fr", url: "https://etudiant-ameli.fr" },
  { n: "06", titre: "Se loger : CROUS et aides CAF", quand: "Dès l'acceptation",
    texte: "Les logements CROUS se demandent via le Dossier social étudiant et trouverunlogement.lescrous.fr. Les étudiants étrangers en séjour régulier peuvent demander l'APL ou l'ALS sur caf.fr. Garantie locative gratuite : Visale.",
    source: "messervices.etudiant.gouv.fr · caf.fr", url: "https://www.messervices.etudiant.gouv.fr" },
  { n: "07", titre: "Ouvrir un compte bancaire", quand: "Premières semaines",
    texte: "Toute personne résidant en France a droit à un compte. En cas de refus, la Banque de France peut désigner une banque d'office (droit au compte).",
    source: "service-public.fr", url: "https://www.service-public.fr/particuliers/vosdroits/F2386" },
  { n: "08", titre: "Travailler pendant ses études", quand: "Pendant l'année",
    texte: "Le VLS-TS ou titre « étudiant » autorise à travailler dans la limite de 964 heures par an (60 % de la durée légale), sans autorisation préalable.",
    source: "service-public.fr", url: "https://www.service-public.fr/particuliers/vosdroits/F2713" },
];

export const faq = [
  { q: "Dois-je parler français pour étudier en France ?", r: "Pas toujours : de nombreux masters et programmes d'écoles sont enseignés en anglais. Le catalogue Campus France permet de filtrer par langue d'enseignement." },
  { q: "Combien coûtent les frais d'inscription ?", r: "En université publique, les étudiants hors UE peuvent être soumis à des droits différenciés, mais beaucoup d'établissements les exonèrent. Les montants sont fixés par arrêté chaque année — à vérifier sur campusfrance.org." },
  { q: "Puis-je travailler pendant mes études ?", r: "Oui, dans la limite de 964 heures par an avec un titre de séjour étudiant (source : service-public.fr)." },
  { q: "Que faire si je n'ai pas validé mon visa à temps ?", r: "La validation doit intervenir dans les 3 mois suivant l'arrivée. Au-delà, contactez la préfecture : vous devrez régulariser votre situation." },
  { q: "Global Students est-il un organisme officiel ?", r: "Non. Nous rassemblons et vulgarisons les informations des sites officiels, toujours cités. Les démarches se font sur les plateformes publiques." },
];

export const temoignages = [
  { nom: "Amina", pays: "Maroc", ecole: "Master à Lyon", texte: "La timeline m'a évité d'oublier la validation du visa. Trois mois, ça passe vite." },
  { nom: "Kenji", pays: "Japon", ecole: "Doctorat à Grenoble", texte: "J'ai trouvé mon laboratoire, puis une communauté de Japonais déjà installés." },
  { nom: "Camila", pays: "Colombie", ecole: "École d'ingénieurs, Toulouse", texte: "Tout est sourcé : je savais exactement sur quel site officiel aller." },
];
