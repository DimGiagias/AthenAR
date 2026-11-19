import type { Exhibit } from './types';

export const exhibitsData: Exhibit[] = [
    {
        id: 0,
        num: '#01',
        corridorId: 'peiraios',
        eraRoom: 'modern',
        year: '1904 / 1933',
        coords: [37.97328, 23.7062],
        svgStyle: 'serafio',
        el: {
            code: 'ΕΚΘΕΜΑ #01',
            roomBadge: '🏙️ Δωμάτιο ΙΙΙ: Νεότερη & Σύγχρονη',
            corridorName: 'Διάδρομος Α: Οδός Πειραιώς',
            title: 'Σεράφειο Συγκρότημα',
            street: 'Πειραιώς 144 & Πέτρου Ράλλη',
            walk: 'Είσαι εδώ • Αφετηρία',
            archTag: 'Λιθόκτιστο & Μοντέρνο Συγκρότημα',
            shortDesc: 'Από το ιστορικό Δημοτικό Βρεφοκομείο του 1904 και το κολυμβητήριο του 1933 στον σημερινό κόμβο καινοτομίας του Δήμου Αθηναίων.',
            audioScript: 'Έκθεμα Πρώτο, Αίθουσα Νεότερης Ιστορίας: Σεράφειο Συγκρότημα στην οδό Πειραιώς. Εδώ θεμελιώθηκε το 1904 το Δημοτικό Βρεφοκομείο Αθηνών, ενώ το 1933 μετατράπηκε σε πρότυπο αθλητικό και κοινωνικό κέντρο.',
            hotspots: [
                {
                    x: '26%', y: '44%',
                    type: 'ΑΡΧΙΤΕΚΤΟΝΙΚΗ ΛΕΠΤΟΜΕΡΕΙΑ',
                    title: 'Τα Πέτρινα Περίπτερα του 1904',
                    text: 'Τα αυθεντικά λιθόκτιστα κτίρια διασώζουν την τυπολογία της αθηναϊκής φιλανθρωπικής αρχιτεκτονικής των αρχών του 20ού αιώνα.'
                },
                {
                    x: '68%', y: '35%',
                    type: 'ΙΣΤΟΡΙΚΟ ΟΡΟΣΗΜΟ',
                    title: 'Η Σχολή Κολύμβησης του 1933',
                    text: 'Στον Μεσοπόλεμο δημιουργήθηκε εδώ η πρώτη οργανωμένη δημοτική πισίνα της Αθήνας για την άθληση της νεολαίας.'
                },
                {
                    x: '50%', y: '68%',
                    type: 'ΜΑΡΤΥΡΙΑ ΓΕΙΤΟΝΙΑΣ',
                    title: 'Ανάμνηση Κατοίκου Ρουφ (1962)',
                    text: '«Κάθε Κυριακή περνούσαμε έξω από τον ψηλό μαντρότοιχο της Πειραιώς και ακούγαμε τις φωνές των παιδιών κάτω από τα πεύκα...» — Κώστας Μ.'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #01',
            roomBadge: '🏙️ Room III: Modern Athens',
            corridorName: 'Corridor A: Pireos Street',
            title: 'Serafeio Complex',
            street: '144 Pireos St. & Petrou Ralli',
            walk: 'You are here • Starting Point',
            archTag: 'Stone Heritage & Innovation Hub',
            shortDesc: 'From the 1904 Municipal Foundling Home and 1933 public swimming pool to today’s flagship center for innovation in Athens.',
            audioScript: 'Exhibit One, Modern Athens Room: The Serafeio Complex on Pireos Street. Founded in 1904 as the Municipal Foundling Home of Athens, it later became a pioneering interwar sports hub in 1933.',
            hotspots: [
                {
                    x: '26%', y: '44%',
                    type: 'ARCHITECTURAL DETAIL',
                    title: 'The 1904 Stone Pavilions',
                    text: 'The original stone-built pavilions preserve the austere elegance of early 20th-century Athenian civic philanthropy.'
                },
                {
                    x: '68%', y: '35%',
                    type: 'HISTORICAL MILESTONE',
                    title: 'The 1933 Public Swimming Pool',
                    text: 'During the interwar years, the Serafeio housed the first organized municipal swimming pool for the youth of Athens.'
                },
                {
                    x: '50%', y: '68%',
                    type: 'ORAL TESTIMONY',
                    title: 'Memory from Rouf Neighborhood (1962)',
                    text: '“Every Sunday we walked past the tall stone wall on Pireos Street and heard children laughing under the pine trees...” — Kostas M.'
                }
            ]
        }
    },
    {
        id: 1,
        num: '#02',
        corridorId: 'peiraios',
        eraRoom: 'modern',
        year: '1857',
        coords: [37.9782, 23.7143],
        svgStyle: 'gazi',
        el: {
            code: 'ΕΚΘΕΜΑ #02',
            roomBadge: '🏙️ Δωμάτιο ΙΙΙ: Νεότερη & Σύγχρονη',
            corridorName: 'Διάδρομος Α: Οδός Πειραιώς',
            title: 'Παλιό Εργοστάσιο Φωταερίου (Γκάζι)',
            street: 'Πειραιώς 100 (Τεχνόπολη)',
            walk: '6 λεπτά περπάτημα (450m)',
            archTag: 'Βιομηχανικό Μνημείο 19ου Αιώνα',
            shortDesc: 'Το εργοστάσιο που έδωσε φως και ενέργεια στην Αθήνα από το 1857 έως το 1984, με τις εμβληματικές κόκκινες καμινάδες.',
            audioScript: 'Έκθεμα Δεύτερο: Παλιό Εργοστάσιο Φωταερίου στην Πειραιώς 100. Από το 1857, οι φούρνοι του έκαιγαν γαιάνθρακα για να φωτίζουν τους δρόμους της Αθήνας, δίνοντας το όνομα Γκάζι σε ολόκληρη τη συνοικία.',
            hotspots: [
                {
                    x: '30%', y: '32%',
                    type: 'ΒΙΟΜΗΧΑΝΙΚΗ ΑΡΧΙΤΕΚΤΟΝΙΚΗ',
                    title: 'Οι Καμινάδες των Φούρνων (1857)',
                    text: 'Οι πλίνθινες καμινάδες λειτουργούσαν ακατάπαυστα επί 127 χρόνια, αποτελώντας το βιομηχανικό τοπόσημο της οδού Πειραιώς.'
                },
                {
                    x: '72%', y: '48%',
                    type: 'ΙΣΤΟΡΙΑ ΤΗΣ ΠΟΛΗΣ',
                    title: 'Οι Φαναρτζήδες (Φανοκόροι) της Αθήνας',
                    text: 'Από εδώ ξεκινούσαν κάθε σούρουπο οι φαναρτζήδες (φανοκόροι) του Δήμου για να ανάψουν χειροκίνητα τα φανάρια στους δρόμους της Αθήνας.'
                },
                {
                    x: '48%', y: '70%',
                    type: 'ΜΑΡΤΥΡΙΑ ΕΡΓΑΤΗ',
                    title: 'Η Σειρήνα της Βάρδιας (1958)',
                    text: '«Όλη η Πειραιώς ρύθμιζε τα ρολόγια της με τη σειρήνα του Γκαζιού στις 7:00 το πρωί.» — Δημήτρης Λ.'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #02',
            roomBadge: '🏙️ Room III: Modern Athens',
            corridorName: 'Corridor A: Pireos Street',
            title: 'Old Gasworks (Gazi - Technopolis)',
            street: '100 Pireos St.',
            walk: '6 min walk (450m)',
            archTag: '19th-Century Industrial Monument',
            shortDesc: 'The historic industrial complex that illuminated Athens from 1857 to 1984, featuring iconic red-brick chimneys and gasholders.',
            audioScript: 'Exhibit Two: The Old Athens Gasworks at 100 Pireos Street. Built in 1857, its furnaces burned coal to light the streets of the capital for over a century, giving the surrounding Gazi district its name.',
            hotspots: [
                {
                    x: '30%', y: '32%',
                    type: 'INDUSTRIAL ARCHITECTURE',
                    title: 'The Red-Brick Furnace Chimneys',
                    text: 'Operating continuously for 127 years, these brick chimneys remain the best-preserved 19th-century industrial ensemble in Greece.'
                },
                {
                    x: '72%', y: '48%',
                    type: 'URBAN HISTORY',
                    title: 'The Lamplighters of Old Athens',
                    text: 'Every dusk, municipal lamplighters set out to manually ignite the gas streetlamps across the historic center.'
                },
                {
                    x: '48%', y: '70%',
                    type: 'WORKER TESTIMONY',
                    title: 'The Morning Shift Siren (1958)',
                    text: '“The entire neighborhood along Pireos Street set their watches by the 7:00 AM Gasworks siren.” — Dimitris L.'
                }
            ]
        }
    },
    {
        id: 2,
        num: '#03',
        corridorId: 'patision',
        eraRoom: 'modern',
        year: '1935',
        coords: [38.0008, 23.7378],
        svgStyle: 'agora',
        el: {
            code: 'ΕΚΘΕΜΑ #03',
            roomBadge: '🏙️ Δωμάτιο ΙΙΙ: Νεότερη & Σύγχρονη',
            corridorName: 'Διάδρομος Β: Πατησίων & Κυψέλη',
            title: 'Δημοτική Αγορά Κυψέλης',
            street: 'Φωκίωνος Νέγρη 42',
            walk: 'Διάδρομος Β • Στάση 1',
            archTag: 'Μεσοπολεμικός Μοντερνισμός / Art Deco',
            shortDesc: 'Αριστούργημα του 1935 πάνω στον πεζόδρομο της Φωκίωνος Νέγρη που σήμερα λειτουργεί ως ανοιχτή αγορά πολιτισμού.',
            audioScript: 'Έκθεμα Τρίτο: Δημοτική Αγορά Κυψέλης. Χτισμένη το 1935 σε σχέδια του αρχιτέκτονα Αλέξανδρου Μεταξά, αποτελεί κόσμημα του αθηναϊκού μεσοπολεμικού μοντερνισμού.',
            hotspots: [
                {
                    x: '50%', y: '34%',
                    type: 'ΜΟΝΤΕΡΝΙΣΜΟΣ 1935',
                    title: 'Η Συμμετρική Art Deco Στοά',
                    text: 'Εγκαινιάστηκε το 1935 με διαμπερή φυσικό αερισμό, λιτές γεωμετρικές γραμμές και 64 εμπορικά καταστήματα.'
                },
                {
                    x: '26%', y: '56%',
                    type: 'ΚΟΙΝΩΝΙΚΗ ΙΣΤΟΡΙΑ',
                    title: 'Η Διάσωση από τους Κατοίκους (2005)',
                    text: 'Χάρη στην κινητοποίηση των πολιτών της Κυψέλης, το κτίριο κηρύχθηκε διατηρητέο μνημείο και απέφυγε την κατεδάφιση.'
                },
                {
                    x: '74%', y: '62%',
                    type: 'ΜΑΡΤΥΡΙΑ ΚΥΨΕΛΗΣ',
                    title: 'Τα Καφεκοπτεία της Φωκίωνος (1968)',
                    text: '«Η μυρωδιά από τον φρεσκοαλεσμένο καφέ στη γωνία της Αγοράς έφτανε μέχρι την Πατησίων!» — Ελένη Π.'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #03',
            roomBadge: '🏙️ Room III: Modern Athens',
            corridorName: 'Corridor B: Patission & Kypseli',
            title: 'Kypseli Municipal Market',
            street: '42 Fokionos Negri St.',
            walk: 'Corridor B • Stop 1',
            archTag: '1935 Interwar Modernism / Art Deco',
            shortDesc: 'A 1935 modernist gem along the leafy Fokionos Negri promenade, reborn as Greece’s first participative civic & cultural agora.',
            audioScript: 'Exhibit Three: Kypseli Municipal Market. Designed in 1935 by architect Alexandros Metaxas, this symmetrical Art Deco arcade embodies the optimism of interwar Athens.',
            hotspots: [
                {
                    x: '50%', y: '34%',
                    type: '1935 ART DECO DESIGN',
                    title: 'The Symmetrical Modernist Arcade',
                    text: 'Built with natural cross-ventilation and clean geometric lines to serve the booming bourgeois neighborhood of Kypseli.'
                },
                {
                    x: '26%', y: '56%',
                    type: 'CIVIC HERITAGE',
                    title: 'Saved by Citizen Mobilization (2005)',
                    text: 'Local residents rallied to protect the building from demolition, securing its status as a listed historical monument.'
                },
                {
                    x: '74%', y: '62%',
                    type: 'LOCAL MEMORY',
                    title: 'Coffee Roasters of Fokionos (1968)',
                    text: '“The aroma of freshly ground coffee from the corner stalls reached all the way down to Patission Avenue!” — Eleni P.'
                }
            ]
        }
    },
    {
        id: 3,
        num: '#04',
        corridorId: 'patision',
        eraRoom: 'modern',
        year: '1933',
        coords: [37.98644, 23.73548],
        svgStyle: 'modernist',
        el: {
            code: 'ΕΚΘΕΜΑ #04',
            roomBadge: '🏙️ Δωμάτιο ΙΙΙ: Νεότερη & Σύγχρονη',
            corridorName: 'Διάδρομος Β: Πατησίων & Κυψέλη',
            title: 'Η Μπλε Πολυκατοικία (Εξάρχεια)',
            street: 'Αραχώβης 61 & Θεμιστοκλέους',
            walk: 'Διάδρομος Β • Στάση 2',
            archTag: 'Πρωτοπορία Μοντέρνας Αρχιτεκτονικής',
            shortDesc: 'Το θρυλικό κτίριο του Κωστή Παναγιωτάκου (1933) που ενθουσίασε τον Λε Κορμπυζιέ και στέγασε ιστορικές προσωπικότητες.',
            audioScript: 'Έκθεμα Τέταρτο: Η Μπλε Πολυκατοικία. Χτισμένη το 1933 από τον αρχιτέκτονα Κωστή Παναγιωτάκο με χρωματική επιμέλεια του ζωγράφου Σπύρου Παπαλουκά. Ο Λε Κορμπυζιέ δήλωσε εντυπωσιασμένος όταν την επισκέφθηκε.',
            hotspots: [
                {
                    x: '38%', y: '36%',
                    type: 'ΑΡΧΙΤΕΚΤΟΝΙΚΟ ΜΑΝΙΦΕΣΤΟ',
                    title: 'Το Χρώμα του Σπύρου Παπαλουκά',
                    text: 'Ο σπουδαίος ζωγράφος επέλεξε το βαθύ μπλε του Αιγαίου και την τερακότα για να τονίσει τους κυβιστικούς όγκους των έρκερ.'
                },
                {
                    x: '68%', y: '56%',
                    type: 'ΠΡΟΣΩΠΑ & ΙΣΤΟΡΙΕΣ',
                    title: 'Οι Διάσημοι Ένοικοι του Κτιρίου',
                    text: 'Εδώ έζησαν η Σοφία Βέμπο, ο Φρέντυ Γερμανός, ο Δημήτρης Χορν, η Κατερίνα Γώγου και ο Λεωνίδας Κύρκος.'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #04',
            roomBadge: '🏙️ Room III: Modern Athens',
            corridorName: 'Corridor B: Patission & Kypseli',
            title: 'The Blue Apartment Building',
            street: '61 Arachovis & Themistokleous St.',
            walk: 'Corridor B • Stop 2',
            archTag: '1933 Avant-Garde Modernism',
            shortDesc: 'Designed by Kyriakoulis Panagiotakos in 1933, this modernist icon captivated Le Corbusier and housed legendary Greek artists.',
            audioScript: 'Exhibit Four: The Blue Apartment Building in Exarcheia. Completed in 1933 by architect Kyriakoulis Panagiotakos with cobalt facades curated by painter Spyros Papaloukas. Le Corbusier famously praised its design.',
            hotspots: [
                {
                    x: '38%', y: '36%',
                    type: 'MODERNIST MANIFESTO',
                    title: 'Spyros Papaloukas’ Cobalt Palette',
                    text: 'The renowned painter chose deep Aegean blue and terracotta accents to highlight the sculptural protruding bay windows.'
                },
                {
                    x: '68%', y: '56%',
                    type: 'CULTURAL LEGENDS',
                    title: 'Bohemian & Artistic Residents',
                    text: 'Home to singer Sofia Vembo, poet Katerina Gogou, actor Dimitris Horn, and journalist Freddy Germanos.'
                }
            ]
        }
    },
    {
        id: 4,
        num: '#05',
        corridorId: 'athinas',
        eraRoom: 'modern',
        year: '1886',
        coords: [37.98037, 23.72762],
        svgStyle: 'agora',
        el: {
            code: 'ΕΚΘΕΜΑ #05',
            roomBadge: '🏙️ Δωμάτιο ΙΙΙ: Νεότερη & Σύγχρονη',
            corridorName: 'Διάδρομος Γ: Οδός Αθηνάς',
            title: 'Βαρβάκειος Κεντρική Αγορά',
            street: 'Οδός Αθηνάς 42',
            walk: 'Διάδρομος Γ • Στάση 1',
            archTag: 'Νεοκλασική Σιδηρά & Λίθινη Αγορά',
            shortDesc: 'Η γαστρονομική και εμπορική καρδιά της Αθήνας από το 1886, με τα χαρακτηριστικά μεταλλικά ζευκτά και το ρολόι της στοάς.',
            audioScript: 'Έκθεμα Πέμπτο: Βαρβάκειος Αγορά στην οδό Αθηνάς. Εγκαινιάστηκε το 1886 σε σχέδια του Ιωάννη Κουμέλη, συνδυάζοντας τη νεοκλασική λιθοδομή με τη βιομηχανική σιδηροκατασκευή της εποχής.',
            hotspots: [
                {
                    x: '50%', y: '32%',
                    type: 'ΜΗΧΑΝΙΚΗ 19ου ΑΙΩΝΑ',
                    title: 'Η Γυάλινη & Μεταλλική Οροφή (1886)',
                    text: 'Εμπνευσμένη από τις μεγάλες κεντρικές αγορές του Παρισιού (Les Halles), επέτρεπε στο αττικό φως να λούζει τους πάγκους.'
                },
                {
                    x: '32%', y: '62%',
                    type: 'ΑΣΤΙΚΗ ΛΑΟΓΡΑΦΙΑ',
                    title: 'Τα Ξενύχτια στα Οινομαγειρεία',
                    text: 'Από τις αρχές του 1900, τα πατσατζίδικα και τα μαγειρεία της Βαρβακείου ένωνουν ξενύχτηδες, καλλιτέχνες και εμπόρους.'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #05',
            roomBadge: '🏙️ Room III: Modern Athens',
            corridorName: 'Corridor C: Athinas Street',
            title: 'Varvakeios Central Market',
            street: '42 Athinas St.',
            walk: 'Corridor C • Stop 1',
            archTag: '1886 Neoclassical Cast-Iron Agora',
            shortDesc: 'The vibrant culinary and commercial heart of Athens since 1886, crowned by glass skylights and neoclassical arcades.',
            audioScript: 'Exhibit Five: Varvakeios Central Market on Athinas Street. Opened in 1886 by architect Ioannis Koumelis, it marries neoclassical stonework with 19th-century European cast-iron skylights.',
            hotspots: [
                {
                    x: '50%', y: '32%',
                    type: '19TH-CENTURY ENGINEERING',
                    title: 'The Cast-Iron & Glass Skylight (1886)',
                    text: 'Inspired by Les Halles in Paris, the iron truss roof floods the bustling market stalls with natural Athenian daylight.'
                },
                {
                    x: '32%', y: '62%',
                    type: 'URBAN FOLKLORE',
                    title: 'All-Night Market Tavernas',
                    text: 'For over a century, the traditional soup kitchens inside Varvakeios have united merchants, musicians, and night owls at dawn.'
                }
            ]
        }
    },
    {
        id: 5,
        num: '#06',
        corridorId: 'athinas',
        eraRoom: 'modern',
        dualAncient: true,
        year: '479 π.Χ. / 1874',
        coords: [37.9818, 23.7278],
        svgStyle: 'neoclassical',
        el: {
            code: 'ΕΚΘΕΜΑ #06',
            roomBadge: '🏛️+🏙️ Γέφυρα Αρχαίας & Νεότερης Αθήνας',
            corridorName: 'Διάδρομος Γ: Οδός Αθηνάς',
            title: 'Δημαρχείο Αθηναίων & Αρχαία Αχαρνική Πύλη',
            street: 'Οδός Αθηνάς 63 (Πλ. Κοτζιά)',
            walk: 'Διάδρομος Γ • Στάση 2',
            archTag: 'Νεοκλασικό Μέγαρο & Κλασικό Τείχος',
            shortDesc: 'Το μέγαρο του Παναγιώτη Κάλκου (1874) συνομιλεί απευθείας με το αρχαίο Θεμιστόκλειο Τείχος και την Αχαρνική Πύλη (479 π.Χ.).',
            audioScript: 'Έκθεμα Έκτο: Δημαρχείο Αθηναίων στην Πλατεία Κοτζιά. Σχεδιάστηκε το 1874 από τον Παναγιώτη Κάλκο, ενώ μπροστά του αποκαλύπτονται σε ανοιχτό σκάμμα η αρχαία Αχαρνική Πύλη και το Θεμιστόκλειο Τείχος του 479 π.Χ.',
            hotspots: [
                {
                    x: '50%', y: '34%',
                    type: 'ΝΕΟΚΛΑΣΙΚΗ ΑΡΜΟΝΙΑ',
                    title: 'Το Μέγαρο του Παναγιώτη Κάλκου (1874)',
                    text: 'Στο εσωτερικό του φυλάσσονται οι μεγάλες ελαιογραφίες του Φώτη Κόντογλου με μορφές της αθηναϊκής ιστορίας.'
                },
                {
                    x: '68%', y: '64%',
                    type: 'ΑΡΧΑΙΟΛΟΓΙΚΟ ΣΤΡΩΜΑ (479 π.Χ.)',
                    title: 'Η Αρχαία Αχαρνική Πύλη',
                    text: 'Στην Πλατεία Κοτζιά βλέπεις ταυτόχρονα 2.500 χρόνια ιστορίας: το αρχαίο τείχος του Θεμιστοκλή δίπλα στο νεοκλασικό Δημαρχείο.'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #06',
            roomBadge: '🏛️+🏙️ Ancient & Modern Bridge',
            corridorName: 'Corridor C: Athinas Street',
            title: 'Athens City Hall & Ancient Acharnian Gate',
            street: '63 Athinas St. (Kotzia Sq.)',
            walk: 'Corridor C • Stop 2',
            archTag: '1874 Palace & 479 BC Classical Wall',
            shortDesc: 'Designed by Panagiotis Kalkos in 1874, standing directly beside the excavated ruins of the 479 BC Acharnian Gate.',
            audioScript: 'Exhibit Six: Athens City Hall on Kotzia Square. Completed in 1874 by architect Panagiotis Kalkos, it overlooks the excavated ancient Acharnian Gate and classical Themistoclean Wall of 479 BC.',
            hotspots: [
                {
                    x: '50%', y: '34%',
                    type: 'NEOCLASSICAL HARMONY',
                    title: 'Panagiotis Kalkos’ Civic Palace (1874)',
                    text: 'Inside the ceremonial hall, monumental frescoes by Fotis Kontoglou depict 3,000 years of Athenian history.'
                },
                {
                    x: '68%', y: '64%',
                    type: 'ARCHAEOLOGICAL LAYER (479 BC)',
                    title: 'The Ancient Acharnian Gate',
                    text: 'Kotzia Square reveals 2,500 years of continuous urban life, uniting the classical Themistoclean Wall with 19th-century Athens.'
                }
            ]
        }
    },
    {
        id: 6,
        num: '#07',
        corridorId: 'peiraios',
        eraRoom: 'ancient',
        year: '449 π.Χ.',
        coords: [37.9756, 23.7214],
        svgStyle: 'ancient_temple',
        el: {
            code: 'ΕΚΘΕΜΑ #07',
            roomBadge: '🏛️ Δωμάτιο Ι: Αρχαία Αθήνα',
            corridorName: 'Διάδρομος Α: Απόληξη Θησείου',
            title: 'Ναός Ηφαίστου (Θησείο) — Αρχαία Αγορά',
            street: 'Λόφος Αγοραίου Κολωνού (Θησείο)',
            walk: 'Αίθουσα Ι • Κλασική Αρχαιότητα',
            archTag: 'Δωρικός Περίπτερος Ναός (5ος αι. π.Χ.)',
            shortDesc: 'Ο καλύτερα διατηρημένος δωρικός ναός της κλασικής αρχαιότητας (449 π.Χ.), αφιερωμένος στον Ήφαιστο και την Αθηνά Εργάνη.',
            audioScript: 'Έκθεμα Έβδομο, Δωμάτιο Αρχαίας Αθήνας: Ναός του Ηφαίστου στο Θησείο. Θεμελιώθηκε το 449 π.Χ. στον λόφο του Αγοραίου Κολωνού, πάνω από τα εργαστήρια των χαλκουργών και κεραμέων της Αρχαίας Αγοράς.',
            hotspots: [
                {
                    x: '50%', y: '28%',
                    type: 'ΚΛΑΣΙΚΗ ΑΡΧΙΤΕΚΤΟΝΙΚΗ (449 π.Χ.)',
                    title: 'Τα Αετώματα & οι Μετόπες του Θησέα',
                    text: 'Οι ανάγλυφες μετόπες από πεντελικό μάρμαρο απεικονίζουν τους άθλους του Ηρακλή και του βασιλιά της Αθήνας Θησέα.'
                },
                {
                    x: '28%', y: '56%',
                    type: 'ΙΣΤΟΡΙΚΗ ΔΙΑΔΡΟΜΗ',
                    title: 'Από τον Ήφαιστο στον Άγιο Γεώργιο Ακαμάτη',
                    text: 'Ο ναός διασώθηκε σχεδόν ακέραιος επειδή τον 7ο αιώνα μ.Χ. μετατράπηκε στον βυζαντινό ναό του Αγίου Γεωργίου.'
                },
                {
                    x: '72%', y: '58%',
                    type: 'ΑΣΤΙΚΗ ΜΝΗΜΗ',
                    title: 'Τα Χαλκουργεία του Κολωνού',
                    text: 'Γύρω από τον ναό βρέθηκαν δεκάδες αρχαίοι κλίβανοι χύτευσης χαλκού και εργαστήρια αγγειοπλαστικής της κλασικής Αθήνας.'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #07',
            roomBadge: '🏛️ Room I: Ancient Athens',
            corridorName: 'Corridor A: Thiseio & Ancient Agora',
            title: 'Temple of Hephaestus (Thiseio)',
            street: 'Agoraios Kolonos Hill (Ancient Agora)',
            walk: 'Room I • Classical Antiquity',
            archTag: '449 BC Doric Peripteral Temple',
            shortDesc: 'The best-preserved Doric temple of classical antiquity (449 BC), overlooking the Ancient Agora of Athens.',
            audioScript: 'Exhibit Seven, Ancient Athens Room: The Temple of Hephaestus in Thiseio. Begun in 449 BC atop Agoraios Kolonos Hill, it honored Hephaestus, patron god of metalworkers, and Athena Ergane.',
            hotspots: [
                {
                    x: '50%', y: '28%',
                    type: 'CLASSICAL SCULPTURE (449 BC)',
                    title: 'Metopes of Theseus & Heracles',
                    text: 'Carved in Pentelic marble, the eastern frieze and metopes celebrate the heroic labors of Heracles and Theseus.'
                },
                {
                    x: '28%', y: '56%',
                    type: 'CONTINUOUS SURVIVAL',
                    title: 'Byzantine Conversion in the 7th Century',
                    text: 'The temple survived intact across millennia thanks to its conversion into the church of St. George Akamates.'
                },
                {
                    x: '72%', y: '58%',
                    type: 'ARCHAEOLOGICAL CONTEXT',
                    title: 'Ancient Bronze Foundries',
                    text: 'Excavations around the hill uncovered numerous classical bronze-casting pits and potter kilns.'
                }
            ]
        }
    },
    {
        id: 7,
        num: '#08',
        corridorId: 'athinas',
        eraRoom: 'ancient',
        year: '1ος αι. π.Χ.',
        coords: [37.9742, 23.7270],
        svgStyle: 'ancient_tower',
        el: {
            code: 'ΕΚΘΕΜΑ #08',
            roomBadge: '🏛️ Δωμάτιο Ι: Αρχαία Αθήνα',
            corridorName: 'Διάδρομος Γ: Αιόλου & Ρωμαϊκή Αγορά',
            title: 'Ωρολόγιο Κυρρήστου (Αέρηδες)',
            street: 'Πλατεία Αέρηδων (Ρωμαϊκή Αγορά)',
            walk: 'Αίθουσα Ι • Αρχαία Επιστήμη',
            archTag: 'Οκταγωνικός Μαρμάρινος Πύργος',
            shortDesc: 'Ο πρώτος μετεωρολογικός και ωρολογιακός σταθμός του κόσμου (1ος αι. π.Χ.), έργο του αστρονόμου Ανδρόνικου από την Κύρρο.',
            audioScript: 'Έκθεμα Όγδοο, Δωμάτιο Αρχαίας Αθήνας: Το Ωρολόγιο του Ανδρόνικου Κυρρήστου, γνωστό ως Αέρηδες. Ένα οκταγωνικό θαύμα αρχαίας ελληνικής μηχανικής με ηλιακά ρολόγια, υδραυλική κλεψύδρα και τις 8 ανάγλυφες προσωποποιήσεις των ανέμων.',
            hotspots: [
                {
                    x: '50%', y: '26%',
                    type: 'ΑΡΧΑΙΑ ΜΗΧΑΝΙΚΗ & ΑΣΤΡΟΝΟΜΙΑ',
                    title: 'Οι 8 Ανάγλυφοι Άνεμοι (Βορέας, Ζέφυρος, Νότος)',
                    text: 'Στην κορυφή κάθε πλευράς του πεντελικού οκταγώνου εικονίζεται φτερωτός ένας από τους οκτώ ανέμους του αττικού ουρανού.'
                },
                {
                    x: '32%', y: '60%',
                    type: 'ΥΔΡΑΥΛΙΚΗ ΤΕΧΝΟΛΟΓΙΑ',
                    title: 'Η Εσωτερική Υδραυλική Κλεψύδρα',
                    text: 'Όταν είχε συννεφιά, η ώρα μετριόταν με υδραυλικό μηχανισμό που τροφοδοτούνταν με νερό από την Κλεψύδρα της Ακρόπολης.'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #08',
            roomBadge: '🏛️ Room I: Ancient Athens',
            corridorName: 'Corridor C: Aiolou & Roman Agora',
            title: 'Tower of the Winds (Horologion of Kyrrhestos)',
            street: 'Aerides Sq. (Roman Agora)',
            walk: 'Room I • Ancient Science',
            archTag: '1st c. BC Octagonal Marble Clocktower',
            shortDesc: 'The world’s first meteorological and timekeeping station (1st c. BC), designed by astronomer Andronicus of Cyrrhus.',
            audioScript: 'Exhibit Eight, Ancient Athens Room: The Tower of the Winds. Built of Pentelic marble in the 1st century BC, this octagonal clocktower combined sundials, a water clock, and reliefs of the eight wind deities.',
            hotspots: [
                {
                    x: '50%', y: '26%',
                    type: 'ANCIENT METEOROLOGY',
                    title: 'The Eight Winged Wind Deities',
                    text: 'Each face of the octagonal frieze depicts a flying personification of the winds: Boreas, Kaikias, Apeliotes, Euros, Notos, Lips, Zephyros, and Skiron.'
                },
                {
                    x: '32%', y: '60%',
                    type: 'HYDRAULIC ENGINEERING',
                    title: 'The Internal Water Clock (Clepsydra)',
                    text: 'At night or on cloudy days, an ingenious hydraulic mechanism driven by water from the Acropolis indicated the time.'
                }
            ]
        }
    },
    {
        id: 8,
        num: '#09',
        corridorId: 'athinas',
        eraRoom: 'byzantine',
        year: '1050 μ.Χ.',
        coords: [37.9763, 23.7286],
        svgStyle: 'byzantine_church',
        el: {
            code: 'ΕΚΘΕΜΑ #09',
            roomBadge: '☦️ Δωμάτιο ΙΙ: Βυζαντινή Αθήνα',
            corridorName: 'Διάδρομος Γ: Ιστορικό Κέντρο / Ερμού',
            title: 'Ι.Ν. Παναγίας Καπνικαρέας',
            street: 'Οδός Ερμού (Πλατεία Καπνικαρέας)',
            walk: 'Αίθουσα ΙΙ • Βυζαντινή Αθήνα',
            archTag: 'Σταυροειδής Εγγεγραμμένος με Αθηναϊκό Τρούλο',
            shortDesc: 'Το βυζαντινό κόσμημα του 1050 μ.Χ. στη μέση της Ερμού, χτισμένο με πλινθοπερίκλειστη τοιχοποιία πάνω σε αρχαίο ιερό.',
            audioScript: 'Έκθεμα Ένατο, Δωμάτιο Βυζαντινής Αθήνας: Παναγία Καπνικαρέα. Χτίστηκε γύρω στο 1050 μ.Χ. και αποτελεί υπόδειγμα του «αθηναϊκού τρούλου» και της βυζαντινής πλινθοπερίκλειστης αρχιτεκτονικής. Το 1834 σώθηκε από κατεδάφιση χάρη στην παρέμβαση του Λουδοβίκου της Βαυαρίας.',
            hotspots: [
                {
                    x: '50%', y: '24%',
                    type: 'ΒΥΖΑΝΤΙΝΗ ΑΡΧΙΤΕΚΤΟΝΙΚΗ (1050 μ.Χ.)',
                    title: 'Ο Οκταγωνικός «Αθηναϊκός Τρούλος»',
                    text: 'Ο ραδινός οκταγωνικός τρούλος με τους μαρμάρινους κιονίσκους στις ακμές αποτελεί το σήμα κατατεθέν της μεσοβυζαντινής Αθήνας.'
                },
                {
                    x: '30%', y: '56%',
                    type: 'ΤΕΧΝΗ & ΑΓΙΟΓΡΑΦΙΑ',
                    title: 'Οι Αγιογραφίες του Φώτη Κόντογλου (1942)',
                    text: 'Στο εσωτερικό του ναού δεσπόζει η Πλατυτέρα και οι βυζαντινές τοιχογραφίες που φιλοτέχνησε ο Φώτης Κόντογλου.'
                },
                {
                    x: '72%', y: '58%',
                    type: 'ΑΣΤΙΚΗ ΔΙΑΣΩΣΗ (1834)',
                    title: 'Γιατί η Ερμού «αγκαλιάζει» τον Ναό',
                    text: 'Κατά τη χάραξη της οδού Ερμού το 1834, το κτίριο επρόκειτο να κατεδαφιστεί, αλλά διασώθηκε και ο δρόμος χωρίστηκε στα δύο γύρω του.'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #09',
            roomBadge: '☦️ Room II: Byzantine Athens',
            corridorName: 'Corridor C: Historic Center / Ermou',
            title: 'Church of Panagia Kapnikarea',
            street: 'Ermou St. (Kapnikarea Sq.)',
            walk: 'Room II • Middle Byzantine Era',
            archTag: '1050 AD Cross-in-Square Byzantine Church',
            shortDesc: 'A 1050 AD Middle-Byzantine masterpiece featuring cloisonné masonry and an octagonal Athenian dome in the heart of Ermou Street.',
            audioScript: 'Exhibit Nine, Byzantine Athens Room: Church of Panagia Kapnikarea. Built around 1050 AD over an ancient temple, it showcases exquisite cloisonné brickwork, ancient spolia columns, and frescoes by Fotis Kontoglou.',
            hotspots: [
                {
                    x: '50%', y: '24%',
                    type: 'BYZANTINE ARCHITECTURE (1050 AD)',
                    title: 'The Octagonal “Athenian Dome”',
                    text: 'Crown jewel of 11th-century Athenian church architecture, featuring arched brick windows and slender marble colonnettes.'
                },
                {
                    x: '30%', y: '56%',
                    type: 'SACRED ART',
                    title: 'Fotis Kontoglou’s Frescoes (1942)',
                    text: 'The interior dome and apse were painted by master iconographer Fotis Kontoglou in authentic Byzantine style.'
                },
                {
                    x: '72%', y: '58%',
                    type: 'URBAN PRESERVATION (1834)',
                    title: 'Saved During the Planning of Ermou St.',
                    text: 'Scheduled for demolition in 1834, the church was saved by King Ludwig I of Bavaria, splitting Ermou Street around it.'
                }
            ]
        }
    },
    {
        id: 9,
        num: '#10',
        corridorId: 'peiraios',
        eraRoom: 'byzantine',
        year: '11ος αι. μ.Χ.',
        coords: [37.97768, 23.72113],
        svgStyle: 'byzantine_church',
        el: {
            code: 'ΕΚΘΕΜΑ #10',
            roomBadge: '☦️ Δωμάτιο ΙΙ: Βυζαντινή Αθήνα',
            corridorName: 'Διάδρομος Α: Θησείο / Πλ. Ασωμάτων',
            title: 'Ι.Ν. Αγίων Ασωμάτων Θησείου',
            street: 'Πλατεία Αγίων Ασωμάτων (Ερμού & Πειραιώς)',
            walk: 'Αίθουσα ΙΙ • Βυζαντινή Αθήνα',
            archTag: 'Βυζαντινός Ναός με Κουφικά Κοσμήματα',
            shortDesc: 'Ναός του δεύτερου μισού του 11ου αιώνα με περίτεχνη πλινθοπερίκλειστη τοιχοποιία και κεραμικά κουφικά διακοσμητικά.',
            audioScript: 'Έκθεμα Δέκατο, Δωμάτιο Βυζαντινής Αθήνας: Ναός Αγίων Ασωμάτων στο Θησείο. Χτισμένος τον 11ο αιώνα εκεί όπου η Ερμού συναντά τον άξονα της Πειραιώς, αποκαλύπτει την ακμή της βυζαντινής Αθήνας.',
            hotspots: [
                {
                    x: '50%', y: '26%',
                    type: 'ΒΥΖΑΝΤΙΝΗ ΚΕΡΑΜΟΠΛΑΣΤΙΚΗ',
                    title: 'Πλινθοπερίκλειστη Τοιχοποιία & Κουφικά',
                    text: 'Στους τοίχους του ναού διασώζονται αυθεντικά κεραμοπλαστικά κοσμήματα του 11ου αιώνα που μιμούνται αραβικούς (κουφικούς) χαρακτήρες.'
                },
                {
                    x: '35%', y: '60%',
                    type: 'ΑΠΟΚΑΤΑΣΤΑΣΗ 1959',
                    title: 'Η Αφαίρεση των Νεωτερικών Προσθηκών',
                    text: 'Το 1959 αφαιρέθηκαν οι μεταγενέστερες προσθήκες και ο ναός ανέκτησε την αυθεντική μεσοβυζαντινή του μορφή.'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #10',
            roomBadge: '☦️ Room II: Byzantine Athens',
            corridorName: 'Corridor A: Thiseio / Asomaton Sq.',
            title: 'Church of Agioi Asomatoi (Thiseio)',
            street: 'Agion Asomaton Sq. (Ermou & Pireos)',
            walk: 'Room II • 11th Century AD',
            archTag: '11th-Century Byzantine Cloisonné Church',
            shortDesc: 'A late 11th-century cross-in-square Byzantine church adorned with Pseudo-Kufic brickwork ornaments.',
            audioScript: 'Exhibit Ten, Byzantine Athens Room: Church of Agioi Asomatoi in Thiseio. Erected in the late 11th century near the junction of Ermou and Pireos streets, it was restored to its pure medieval form in 1959.',
            hotspots: [
                {
                    x: '50%', y: '26%',
                    type: 'BYZANTINE BRICKWORK',
                    title: 'Cloisonné Masonry & Pseudo-Kufic Friezes',
                    text: 'The facade features finely cut porous stone framed by red bricks and decorative ceramic motifs.'
                },
                {
                    x: '35%', y: '60%',
                    type: '1959 RESTORATION',
                    title: 'Revealing the 11th-Century Original',
                    text: 'In 1959, 19th-century alterations were carefully removed, revealing the original medieval cross-in-square church.'
                }
            ]
        }
    },
    {
        id: 10,
        num: '#11',
        corridorId: 'athinas',
        eraRoom: 'ancient',
        year: '447–432 π.Χ.',
        coords: [37.9715, 23.7267],
        svgStyle: 'parthenon',
        el: {
            code: 'ΕΚΘΕΜΑ #11',
            roomBadge: '🏛️ Δωμάτιο Ι: Αρχαία Αθήνα (Κορωνίδα)',
            corridorName: 'Διάδρομος Γ: Ιερός Βράχος Ακρόπολης',
            title: 'Ακρόπολη & Παρθενώνας',
            street: 'Ιερός Βράχος Ακρόπολης Αθηνών',
            walk: 'Αίθουσα Ι • Το Σύμβολο της Κλασικής Αθήνας',
            archTag: 'Δωρικός Οκτάστυλος Περίπτερος Ναός',
            shortDesc: 'Το παγκόσμιο σύμβολο της κλασικής αρχαιότητας και της Δημοκρατίας (447–432 π.Χ.), έργο των Ικτίνου, Καλλικράτη και του γλύπτη Φειδία.',
            audioScript: 'Έκθεμα Ενδέκατο, Κορωνίδα του Δωματίου Αρχαίας Αθήνας: Ο Παρθενώνας στην Ακρόπολη. Χτίστηκε από πεντελικό μάρμαρο μεταξύ 447 και 432 π.Χ. από τους αρχιτέκτονες Ικτίνο και Καλλικράτη, με τη γλυπτική επιμέλεια του Φειδία, ως αιώνιο μνημείο της Αθηναϊκής Δημοκρατίας.',
            hotspots: [
                {
                    x: '50%', y: '24%',
                    type: 'ΓΛΥΠΤΙΚΗ ΤΟΥ ΦΕΙΔΙΑ (438 π.Χ.)',
                    title: 'Τα Αετώματα & η Ζωφόρος των Παναθηναίων',
                    text: 'Το ανατολικό αέτωμα αφηγείται τη γέννηση της θεάς Αθηνάς από το κεφάλι του Δία, ενώ η ζωφόρος των 160 μέτρων απεικονίζει την πομπή των Μεγάλων Παναθηναίων.'
                },
                {
                    x: '28%', y: '54%',
                    type: 'ΑΡΧΙΤΕΚΤΟΝΙΚΗ ΤΕΛΕΙΟΤΗΤΑ',
                    title: 'Οι Μυστικές Οπτικές Εκλεπτύνσεις (Ένταση)',
                    text: 'Καμία γραμμή στον Παρθενώνα δεν είναι απόλυτα ευθεία: το κρηπίδωμα καμπυλώνει ανεπαίσθητα και οι δωρικοί κίονες γέρνουν ελαφρά προς τα μέσα για να φαίνονται τέλειοι στο ανθρώπινο μάτι.'
                },
                {
                    x: '72%', y: '56%',
                    type: 'ΤΟ ΙΕΡΟ ΤΗΣ ΠΟΛΗΣ',
                    title: 'Το Χρυσελεφάντινο Άγαλμα της Αθηνάς Παρθένου',
                    text: 'Μέσα στον σηκό έστεκε το ύψους 12 μέτρων άγαλμα της Αθηνάς Παρθένου από χρυσό και ελεφαντόδοντο, έργο του Φειδία (πάτησε X-Ray στο 3D για να το δεις!).'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #11',
            roomBadge: '🏛️ Room I: Ancient Athens (Crown Jewel)',
            corridorName: 'Corridor C: Sacred Rock of the Acropolis',
            title: 'The Acropolis & Parthenon',
            street: 'Sacred Rock of the Acropolis',
            walk: 'Room I • Universal Symbol of Classical Greece',
            archTag: '447–432 BC Octastyle Doric Masterpiece',
            shortDesc: 'The supreme monument of Classical Greece and Athenian Democracy (447–432 BC), created by Ictinus, Callicrates, and sculptor Phidias.',
            audioScript: 'Exhibit Eleven, Crown Jewel of the Ancient Athens Room: The Parthenon on the Acropolis. Constructed of Pentelic marble between 447 and 432 BC by architects Ictinus and Callicrates under master sculptor Phidias.',
            hotspots: [
                {
                    x: '50%', y: '24%',
                    type: 'SCULPTURE BY PHIDIAS (438 BC)',
                    title: 'The Pediments & Panathenaic Frieze',
                    text: 'The east pediment depicts the birth of Athena from the head of Zeus, while the 160-meter frieze portrays the Great Panathenaic procession.'
                },
                {
                    x: '28%', y: '54%',
                    type: 'OPTICAL REFINEMENTS',
                    title: 'Curved Stylobate & Column Entasis',
                    text: 'Not a single line on the Parthenon is strictly straight; subtle upward curvature of the steps and inward leaning columns create visual perfection.'
                },
                {
                    x: '72%', y: '56%',
                    type: 'INNER SANCTUARY (NAOS)',
                    title: 'Chryselephantine Statue of Athena Parthenos',
                    text: 'Inside the cella stood Phidias’ 12-meter statue of Athena Parthenos crafted from gold and ivory (toggle X-Ray in 3D to see inside!).'
                }
            ]
        }
    }
];
