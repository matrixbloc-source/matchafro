/**
 * MatchAfro — Location data hierarchy
 * Structure DB-ready: chaque entité a un id unique et une clé de relation
 * vers son parent. En production, ces tableaux viennent d'une API REST.
 */

/* ─── PAYS ─────────────────────────────────────────────────── */
export const PAYS = [
  // Métropole
  { id: 'FR',  name: 'France',           flag: '🇫🇷', group: 'France' },
  // DOM-TOM
  { id: 'GP',  name: 'Guadeloupe',        flag: '🇬🇵', group: 'Outre-mer' },
  { id: 'MQ',  name: 'Martinique',        flag: '🇲🇶', group: 'Outre-mer' },
  { id: 'GF',  name: 'Guyane',            flag: '🇬🇫', group: 'Outre-mer' },
  { id: 'RE',  name: 'La Réunion',        flag: '🇷🇪', group: 'Outre-mer' },
  { id: 'YT',  name: 'Mayotte',           flag: '🇾🇹', group: 'Outre-mer' },
  // Afrique francophone
  { id: 'KM',  name: 'Comores',           flag: '🇰🇲', group: 'Afrique' },
  { id: 'SN',  name: 'Sénégal',           flag: '🇸🇳', group: 'Afrique' },
  { id: 'CI',  name: "Côte d'Ivoire",    flag: '🇨🇮', group: 'Afrique' },
  { id: 'CM',  name: 'Cameroun',          flag: '🇨🇲', group: 'Afrique' },
  { id: 'ML',  name: 'Mali',              flag: '🇲🇱', group: 'Afrique' },
];

/* ─── RÉGIONS ───────────────────────────────────────────────── */
export const REGIONS = [
  // France métropolitaine (13 régions)
  { id: 'IDF', name: 'Île-de-France',                    pays_id: 'FR' },
  { id: 'ARA', name: 'Auvergne-Rhône-Alpes',             pays_id: 'FR' },
  { id: 'BFC', name: 'Bourgogne-Franche-Comté',          pays_id: 'FR' },
  { id: 'BRE', name: 'Bretagne',                          pays_id: 'FR' },
  { id: 'CVL', name: 'Centre-Val de Loire',               pays_id: 'FR' },
  { id: 'COR', name: 'Corse',                             pays_id: 'FR' },
  { id: 'GES', name: 'Grand Est',                         pays_id: 'FR' },
  { id: 'HDF', name: 'Hauts-de-France',                   pays_id: 'FR' },
  { id: 'NOR', name: 'Normandie',                         pays_id: 'FR' },
  { id: 'NAQ', name: 'Nouvelle-Aquitaine',                pays_id: 'FR' },
  { id: 'OCC', name: 'Occitanie',                         pays_id: 'FR' },
  { id: 'PDL', name: 'Pays de la Loire',                  pays_id: 'FR' },
  { id: 'PAC', name: "Provence-Alpes-Côte d'Azur",       pays_id: 'FR' },
  // DOM (chaque DOM est aussi sa région)
  { id: 'R-GP', name: 'Guadeloupe',   pays_id: 'GP' },
  { id: 'R-MQ', name: 'Martinique',   pays_id: 'MQ' },
  { id: 'R-GF', name: 'Guyane',       pays_id: 'GF' },
  { id: 'R-RE', name: 'La Réunion',   pays_id: 'RE' },
  { id: 'R-YT', name: 'Mayotte',      pays_id: 'YT' },
  // Afrique (grandes zones)
  { id: 'SN-DAK', name: 'Dakar',          pays_id: 'SN' },
  { id: 'SN-STL', name: 'Saint-Louis',    pays_id: 'SN' },
  { id: 'SN-THI', name: 'Thiès',          pays_id: 'SN' },
  { id: 'CI-LAG', name: 'Lagunes',        pays_id: 'CI' },
  { id: 'CI-VAL', name: 'Vallée du Bandama', pays_id: 'CI' },
  { id: 'CM-CEN', name: 'Centre',         pays_id: 'CM' },
  { id: 'CM-LIT', name: 'Littoral',       pays_id: 'CM' },
  { id: 'ML-KOU', name: 'Koulikoro',      pays_id: 'ML' },
  { id: 'ML-SIK', name: 'Sikasso',        pays_id: 'ML' },
  { id: 'KM-GRA', name: 'Grande Comore', pays_id: 'KM' },
];

/* ─── DÉPARTEMENTS ──────────────────────────────────────────── */
export const DEPARTEMENTS = [
  // Île-de-France
  { id: '75', code: '75', name: 'Paris',              region_id: 'IDF' },
  { id: '77', code: '77', name: 'Seine-et-Marne',     region_id: 'IDF' },
  { id: '78', code: '78', name: 'Yvelines',           region_id: 'IDF' },
  { id: '91', code: '91', name: 'Essonne',            region_id: 'IDF' },
  { id: '92', code: '92', name: 'Hauts-de-Seine',     region_id: 'IDF' },
  { id: '93', code: '93', name: 'Seine-Saint-Denis',  region_id: 'IDF' },
  { id: '94', code: '94', name: 'Val-de-Marne',       region_id: 'IDF' },
  { id: '95', code: '95', name: "Val-d'Oise",         region_id: 'IDF' },
  // Auvergne-Rhône-Alpes
  { id: '01', code: '01', name: 'Ain',                region_id: 'ARA' },
  { id: '03', code: '03', name: 'Allier',             region_id: 'ARA' },
  { id: '07', code: '07', name: 'Ardèche',            region_id: 'ARA' },
  { id: '15', code: '15', name: 'Cantal',             region_id: 'ARA' },
  { id: '26', code: '26', name: 'Drôme',              region_id: 'ARA' },
  { id: '38', code: '38', name: 'Isère',              region_id: 'ARA' },
  { id: '42', code: '42', name: 'Loire',              region_id: 'ARA' },
  { id: '43', code: '43', name: 'Haute-Loire',        region_id: 'ARA' },
  { id: '63', code: '63', name: 'Puy-de-Dôme',       region_id: 'ARA' },
  { id: '69', code: '69', name: 'Rhône',              region_id: 'ARA' },
  { id: '73', code: '73', name: 'Savoie',             region_id: 'ARA' },
  { id: '74', code: '74', name: 'Haute-Savoie',       region_id: 'ARA' },
  // Bourgogne-Franche-Comté
  { id: '21', code: '21', name: "Côte-d'Or",          region_id: 'BFC' },
  { id: '25', code: '25', name: 'Doubs',              region_id: 'BFC' },
  { id: '39', code: '39', name: 'Jura',               region_id: 'BFC' },
  { id: '58', code: '58', name: 'Nièvre',             region_id: 'BFC' },
  { id: '70', code: '70', name: 'Haute-Saône',        region_id: 'BFC' },
  { id: '71', code: '71', name: 'Saône-et-Loire',     region_id: 'BFC' },
  { id: '89', code: '89', name: 'Yonne',              region_id: 'BFC' },
  { id: '90', code: '90', name: 'Territoire de Belfort', region_id: 'BFC' },
  // Bretagne
  { id: '22', code: '22', name: "Côtes-d'Armor",      region_id: 'BRE' },
  { id: '29', code: '29', name: 'Finistère',          region_id: 'BRE' },
  { id: '35', code: '35', name: 'Ille-et-Vilaine',    region_id: 'BRE' },
  { id: '56', code: '56', name: 'Morbihan',           region_id: 'BRE' },
  // Centre-Val de Loire
  { id: '18', code: '18', name: 'Cher',               region_id: 'CVL' },
  { id: '28', code: '28', name: 'Eure-et-Loir',       region_id: 'CVL' },
  { id: '36', code: '36', name: 'Indre',              region_id: 'CVL' },
  { id: '37', code: '37', name: 'Indre-et-Loire',     region_id: 'CVL' },
  { id: '41', code: '41', name: 'Loir-et-Cher',       region_id: 'CVL' },
  { id: '45', code: '45', name: 'Loiret',             region_id: 'CVL' },
  // Corse
  { id: '2A', code: '2A', name: 'Corse-du-Sud',       region_id: 'COR' },
  { id: '2B', code: '2B', name: 'Haute-Corse',        region_id: 'COR' },
  // Grand Est
  { id: '08', code: '08', name: 'Ardennes',           region_id: 'GES' },
  { id: '10', code: '10', name: 'Aube',               region_id: 'GES' },
  { id: '51', code: '51', name: 'Marne',              region_id: 'GES' },
  { id: '52', code: '52', name: 'Haute-Marne',        region_id: 'GES' },
  { id: '54', code: '54', name: 'Meurthe-et-Moselle', region_id: 'GES' },
  { id: '55', code: '55', name: 'Meuse',              region_id: 'GES' },
  { id: '57', code: '57', name: 'Moselle',            region_id: 'GES' },
  { id: '67', code: '67', name: 'Bas-Rhin',           region_id: 'GES' },
  { id: '68', code: '68', name: 'Haut-Rhin',          region_id: 'GES' },
  { id: '88', code: '88', name: 'Vosges',             region_id: 'GES' },
  // Hauts-de-France
  { id: '02', code: '02', name: 'Aisne',              region_id: 'HDF' },
  { id: '59', code: '59', name: 'Nord',               region_id: 'HDF' },
  { id: '60', code: '60', name: 'Oise',               region_id: 'HDF' },
  { id: '62', code: '62', name: 'Pas-de-Calais',      region_id: 'HDF' },
  { id: '80', code: '80', name: 'Somme',              region_id: 'HDF' },
  // Normandie
  { id: '14', code: '14', name: 'Calvados',           region_id: 'NOR' },
  { id: '27', code: '27', name: 'Eure',               region_id: 'NOR' },
  { id: '50', code: '50', name: 'Manche',             region_id: 'NOR' },
  { id: '61', code: '61', name: 'Orne',               region_id: 'NOR' },
  { id: '76', code: '76', name: 'Seine-Maritime',     region_id: 'NOR' },
  // Nouvelle-Aquitaine
  { id: '16', code: '16', name: 'Charente',           region_id: 'NAQ' },
  { id: '17', code: '17', name: 'Charente-Maritime',  region_id: 'NAQ' },
  { id: '19', code: '19', name: 'Corrèze',            region_id: 'NAQ' },
  { id: '23', code: '23', name: 'Creuse',             region_id: 'NAQ' },
  { id: '24', code: '24', name: 'Dordogne',           region_id: 'NAQ' },
  { id: '33', code: '33', name: 'Gironde',            region_id: 'NAQ' },
  { id: '40', code: '40', name: 'Landes',             region_id: 'NAQ' },
  { id: '47', code: '47', name: 'Lot-et-Garonne',     region_id: 'NAQ' },
  { id: '64', code: '64', name: 'Pyrénées-Atlantiques', region_id: 'NAQ' },
  { id: '79', code: '79', name: 'Deux-Sèvres',        region_id: 'NAQ' },
  { id: '86', code: '86', name: 'Vienne',             region_id: 'NAQ' },
  { id: '87', code: '87', name: 'Haute-Vienne',       region_id: 'NAQ' },
  // Occitanie
  { id: '09', code: '09', name: 'Ariège',             region_id: 'OCC' },
  { id: '11', code: '11', name: 'Aude',               region_id: 'OCC' },
  { id: '12', code: '12', name: 'Aveyron',            region_id: 'OCC' },
  { id: '30', code: '30', name: 'Gard',               region_id: 'OCC' },
  { id: '31', code: '31', name: 'Haute-Garonne',      region_id: 'OCC' },
  { id: '32', code: '32', name: 'Gers',               region_id: 'OCC' },
  { id: '34', code: '34', name: 'Hérault',            region_id: 'OCC' },
  { id: '46', code: '46', name: 'Lot',                region_id: 'OCC' },
  { id: '48', code: '48', name: 'Lozère',             region_id: 'OCC' },
  { id: '65', code: '65', name: 'Hautes-Pyrénées',    region_id: 'OCC' },
  { id: '66', code: '66', name: 'Pyrénées-Orientales',region_id: 'OCC' },
  { id: '81', code: '81', name: 'Tarn',               region_id: 'OCC' },
  { id: '82', code: '82', name: 'Tarn-et-Garonne',    region_id: 'OCC' },
  // Pays de la Loire
  { id: '44', code: '44', name: 'Loire-Atlantique',   region_id: 'PDL' },
  { id: '49', code: '49', name: 'Maine-et-Loire',     region_id: 'PDL' },
  { id: '53', code: '53', name: 'Mayenne',            region_id: 'PDL' },
  { id: '72', code: '72', name: 'Sarthe',             region_id: 'PDL' },
  { id: '85', code: '85', name: 'Vendée',             region_id: 'PDL' },
  // Provence-Alpes-Côte d'Azur
  { id: '04', code: '04', name: 'Alpes-de-Haute-Provence', region_id: 'PAC' },
  { id: '05', code: '05', name: 'Hautes-Alpes',       region_id: 'PAC' },
  { id: '06', code: '06', name: 'Alpes-Maritimes',    region_id: 'PAC' },
  { id: '13', code: '13', name: 'Bouches-du-Rhône',   region_id: 'PAC' },
  { id: '83', code: '83', name: 'Var',                region_id: 'PAC' },
  { id: '84', code: '84', name: 'Vaucluse',           region_id: 'PAC' },
  // DOM
  { id: '971', code: '971', name: 'Guadeloupe',   region_id: 'R-GP' },
  { id: '972', code: '972', name: 'Martinique',   region_id: 'R-MQ' },
  { id: '973', code: '973', name: 'Guyane',       region_id: 'R-GF' },
  { id: '974', code: '974', name: 'La Réunion',   region_id: 'R-RE' },
  { id: '976', code: '976', name: 'Mayotte',      region_id: 'R-YT' },
  // Afrique (département = ville principale)
  { id: 'SN-01', name: 'Dakar',            region_id: 'SN-DAK', pays_id: 'SN' },
  { id: 'SN-02', name: 'Pikine',           region_id: 'SN-DAK', pays_id: 'SN' },
  { id: 'SN-03', name: 'Saint-Louis',      region_id: 'SN-STL', pays_id: 'SN' },
  { id: 'SN-04', name: 'Thiès',            region_id: 'SN-THI', pays_id: 'SN' },
  { id: 'CI-01', name: 'Abidjan',          region_id: 'CI-LAG', pays_id: 'CI' },
  { id: 'CI-02', name: 'Bouaké',           region_id: 'CI-VAL', pays_id: 'CI' },
  { id: 'CM-01', name: 'Yaoundé',          region_id: 'CM-CEN', pays_id: 'CM' },
  { id: 'CM-02', name: 'Douala',           region_id: 'CM-LIT', pays_id: 'CM' },
  { id: 'ML-01', name: 'Bamako',           region_id: 'ML-KOU', pays_id: 'ML' },
  { id: 'ML-02', name: 'Sikasso',          region_id: 'ML-SIK', pays_id: 'ML' },
  { id: 'KM-01', name: 'Moroni',           region_id: 'KM-GRA', pays_id: 'KM' },
];

/* ─── VILLES ────────────────────────────────────────────────── */
export const VILLES = [
  // Paris & IDF
  { id: 'paris',      name: 'Paris',                dept_id: '75', has_arrondissements: true },
  { id: 'boulogne',   name: 'Boulogne-Billancourt', dept_id: '92' },
  { id: 'nanterre',   name: 'Nanterre',             dept_id: '92' },
  { id: 'courbevoie', name: 'Courbevoie',           dept_id: '92' },
  { id: 'vincennes',  name: 'Vincennes',            dept_id: '94' },
  { id: 'creteil',    name: 'Créteil',              dept_id: '94' },
  { id: 'montreuil',  name: 'Montreuil',            dept_id: '93' },
  { id: 'saint-denis-93', name: 'Saint-Denis',      dept_id: '93' },
  { id: 'aubervilliers', name: 'Aubervilliers',     dept_id: '93' },
  { id: 'argenteuil', name: 'Argenteuil',           dept_id: '95' },
  { id: 'versailles', name: 'Versailles',           dept_id: '78' },
  { id: 'melun',      name: 'Melun',                dept_id: '77' },
  // Auvergne-Rhône-Alpes
  { id: 'lyon',       name: 'Lyon',                 dept_id: '69', has_arrondissements: true },
  { id: 'grenoble',   name: 'Grenoble',             dept_id: '38' },
  { id: 'clermont',   name: 'Clermont-Ferrand',     dept_id: '63' },
  { id: 'saint-etienne', name: 'Saint-Étienne',    dept_id: '42' },
  { id: 'annecy',     name: 'Annecy',               dept_id: '74' },
  { id: 'chambery',   name: 'Chambéry',             dept_id: '73' },
  { id: 'valence',    name: 'Valence',              dept_id: '26' },
  // PACA
  { id: 'marseille',  name: 'Marseille',            dept_id: '13', has_arrondissements: true },
  { id: 'nice',       name: 'Nice',                 dept_id: '06' },
  { id: 'toulon',     name: 'Toulon',               dept_id: '83' },
  { id: 'aix',        name: 'Aix-en-Provence',      dept_id: '13' },
  { id: 'avignon',    name: 'Avignon',              dept_id: '84' },
  { id: 'cannes',     name: 'Cannes',               dept_id: '06' },
  // Hauts-de-France
  { id: 'lille',      name: 'Lille',                dept_id: '59' },
  { id: 'amiens',     name: 'Amiens',               dept_id: '80' },
  { id: 'roubaix',    name: 'Roubaix',              dept_id: '59' },
  { id: 'tourcoing',  name: 'Tourcoing',            dept_id: '59' },
  { id: 'lens',       name: 'Lens',                 dept_id: '62' },
  // Nouvelle-Aquitaine
  { id: 'bordeaux',   name: 'Bordeaux',             dept_id: '33' },
  { id: 'limoges',    name: 'Limoges',              dept_id: '87' },
  { id: 'poitiers',   name: 'Poitiers',             dept_id: '86' },
  { id: 'pau',        name: 'Pau',                  dept_id: '64' },
  { id: 'bayonne',    name: 'Bayonne',              dept_id: '64' },
  // Occitanie
  { id: 'toulouse',   name: 'Toulouse',             dept_id: '31' },
  { id: 'montpellier',name: 'Montpellier',          dept_id: '34' },
  { id: 'nimes',      name: 'Nîmes',                dept_id: '30' },
  { id: 'perpignan',  name: 'Perpignan',            dept_id: '66' },
  { id: 'beziers',    name: 'Béziers',              dept_id: '34' },
  // Pays de la Loire
  { id: 'nantes',     name: 'Nantes',               dept_id: '44' },
  { id: 'le-mans',    name: 'Le Mans',              dept_id: '72' },
  { id: 'angers',     name: 'Angers',               dept_id: '49' },
  // Normandie
  { id: 'rouen',      name: 'Rouen',                dept_id: '76' },
  { id: 'caen',       name: 'Caen',                 dept_id: '14' },
  { id: 'le-havre',   name: 'Le Havre',             dept_id: '76' },
  // Bretagne
  { id: 'rennes',     name: 'Rennes',               dept_id: '35' },
  { id: 'brest',      name: 'Brest',                dept_id: '29' },
  { id: 'quimper',    name: 'Quimper',              dept_id: '29' },
  // Grand Est
  { id: 'strasbourg', name: 'Strasbourg',           dept_id: '67' },
  { id: 'metz',       name: 'Metz',                 dept_id: '57' },
  { id: 'reims',      name: 'Reims',                dept_id: '51' },
  { id: 'nancy',      name: 'Nancy',                dept_id: '54' },
  { id: 'mulhouse',   name: 'Mulhouse',             dept_id: '68' },
  // Centre-Val de Loire
  { id: 'orleans',    name: 'Orléans',              dept_id: '45' },
  { id: 'tours',      name: 'Tours',                dept_id: '37' },
  // DOM
  { id: 'pointe-a-pitre',  name: 'Pointe-à-Pitre',           dept_id: '971' },
  { id: 'basse-terre',     name: 'Basse-Terre',               dept_id: '971' },
  { id: 'les-abymes',      name: 'Les Abymes',                dept_id: '971' },
  { id: 'fort-de-france',  name: 'Fort-de-France',            dept_id: '972' },
  { id: 'le-lamentin',     name: 'Le Lamentin',               dept_id: '972' },
  { id: 'cayenne',         name: 'Cayenne',                   dept_id: '973' },
  { id: 'saint-laurent',   name: 'Saint-Laurent-du-Maroni',   dept_id: '973' },
  { id: 'saint-denis-re',  name: 'Saint-Denis',               dept_id: '974' },
  { id: 'saint-paul-re',   name: 'Saint-Paul',                dept_id: '974' },
  { id: 'saint-pierre-re', name: 'Saint-Pierre',              dept_id: '974' },
  { id: 'mamoudzou',       name: 'Mamoudzou',                 dept_id: '976' },
  { id: 'koungou',         name: 'Koungou',                   dept_id: '976' },
  // Afrique
  { id: 'dakar',     name: 'Dakar',     dept_id: 'SN-01' },
  { id: 'pikine',    name: 'Pikine',    dept_id: 'SN-02' },
  { id: 'thies',     name: 'Thiès',     dept_id: 'SN-04' },
  { id: 'abidjan',   name: 'Abidjan',   dept_id: 'CI-01' },
  { id: 'bouake',    name: 'Bouaké',    dept_id: 'CI-02' },
  { id: 'yaounde',   name: 'Yaoundé',   dept_id: 'CM-01' },
  { id: 'douala',    name: 'Douala',    dept_id: 'CM-02' },
  { id: 'bamako',    name: 'Bamako',    dept_id: 'ML-01' },
  { id: 'sikasso',   name: 'Sikasso',   dept_id: 'ML-02' },
  { id: 'moroni',    name: 'Moroni',    dept_id: 'KM-01' },
];

/* ─── ARRONDISSEMENTS ───────────────────────────────────────── */
const makeArr = (villeId, count, labels = null) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${villeId}-arr-${i + 1}`,
    name: labels ? labels[i] : (i === 0 ? `1er arrondissement` : `${i + 1}e arrondissement`),
    short: i === 0 ? '1er' : `${i + 1}e`,
    ville_id: villeId,
  }));

export const ARRONDISSEMENTS = [
  ...makeArr('paris', 20),
  ...makeArr('lyon', 9),
  ...makeArr('marseille', 16),
];

/* ─── HELPERS ───────────────────────────────────────────────── */

export function getRegions(pays_id) {
  return REGIONS.filter(r => r.pays_id === pays_id);
}

export function getDepts(region_id) {
  return DEPARTEMENTS.filter(d => d.region_id === region_id);
}

export function getVilles(dept_id) {
  return VILLES.filter(v => v.dept_id === dept_id);
}

export function getArrs(ville_id) {
  return ARRONDISSEMENTS.filter(a => a.ville_id === ville_id);
}

export function hasArrs(ville_id) {
  const ville = VILLES.find(v => v.id === ville_id);
  return !!ville?.has_arrondissements;
}

export function getPaysLabel(pays_id) {
  return PAYS.find(p => p.id === pays_id)?.name ?? '';
}

export function getRegionLabel(region_id) {
  return REGIONS.find(r => r.id === region_id)?.name ?? '';
}

export function getDeptLabel(dept_id) {
  return DEPARTEMENTS.find(d => d.id === dept_id)?.name ?? '';
}

export function getVilleLabel(ville_id) {
  return VILLES.find(v => v.id === ville_id)?.name ?? '';
}

export function getArrLabel(arr_id) {
  return ARRONDISSEMENTS.find(a => a.id === arr_id)?.short ?? '';
}

/** Retourne le libellé complet de localisation sélectionnée */
export function buildLocationLabel({ pays, region, dept, ville, arr }) {
  const parts = [];
  if (arr)    parts.push(getArrLabel(arr));
  if (ville)  parts.push(getVilleLabel(ville));
  else if (dept)   parts.push(getDeptLabel(dept));
  else if (region) parts.push(getRegionLabel(region));
  else if (pays)   parts.push(getPaysLabel(pays));
  return parts.join(', ');
}
