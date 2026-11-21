import type { Exhibit } from './types';

export const exhibitsData: Exhibit[] = [
    {
        id: 0,
        num: '#01',
        eraRoom: 'modern',
        year: '2017',
        // The open-air pool of the 1960s, rather than the empty plot of 1950.
        eraLabels: { '1950': '1980' },
        coords: [37.97328, 23.7062],
        svgStyle: 'serafio',
        el: {
            code: 'ΕΚΘΕΜΑ #01',
            roomBadge: '🏙️ Δωμάτιο ΙΙΙ: Νεότερη & Σύγχρονη',
            title: 'Σεράφειο Συγκρότημα',
            street: 'Πειραιώς 144 & Πέτρου Ράλλη',
            walk: 'Είσαι εδώ • Αφετηρία',
            archTag: 'Κέντρο Αθλητισμού, Πολιτισμού & Καινοτομίας',
            shortDesc: 'Από τη δωρεά του Αλκιβιάδη Σεράφη για δημόσια λουτρά και το κολυμβητήριο της δεκαετίας του 1960 στο σημερινό κέντρο αθλητισμού, πολιτισμού και καινοτομίας του Δήμου Αθηναίων (2017).',
            audioScript: 'Έκθεμα Πρώτο, Αίθουσα Νεότερης Ιστορίας: το Σεράφειο, στην οδό Πειραιώς. Πήρε το όνομά του από τον Αλκιβιάδη Σεράφη, που άφησε στον Δήμο Αθηναίων χρήματα για δημόσια λουτρά. Τη δεκαετία του 1960 χτίστηκε εδώ κολυμβητήριο, και το 2017 άνοιξε το σημερινό κέντρο αθλητισμού, πολιτισμού και καινοτομίας.',
            hotspots: [
                {
                    x: '26%', y: '44%',
                    type: 'ΤΟ ΟΝΟΜΑ',
                    title: 'Η δωρεά του Αλκιβιάδη Σεράφη',
                    text: 'Στα τέλη της δεκαετίας του 1930 ο Αλκιβιάδης Σεράφης άφησε με τη διαθήκη του χρήματα στον Δήμο Αθηναίων για δημόσια λουτρά σε δημοτικό οικόπεδο, δωρεάν για τους κατοίκους. Ήρθαν ο πόλεμος και ο εμφύλιος, και τα λουτρά δεν χτίστηκαν.'
                },
                {
                    x: '68%', y: '35%',
                    type: 'ΙΣΤΟΡΙΚΟ ΟΡΟΣΗΜΟ',
                    title: 'Το Σεράφειο Κολυμβητήριο',
                    text: 'Τη δεκαετία του 1960, αντί για λουτρά, χτίστηκε εδώ κολυμβητήριο με το όνομα του δωρητή. Έκλεισε μετά τον σεισμό του 1999. Το νέο κλειστό κολυμβητήριο, με 370 θέσεις, άνοιξε τον Σεπτέμβριο του 2017.'
                },
                {
                    x: '50%', y: '68%',
                    type: 'ΣΗΜΕΡΑ',
                    title: 'Κέντρο Πολιτισμού & Καινοτομίας',
                    text: 'Το τετραώροφο κτίριο στην Πέτρου Ράλλη φιλοξενεί δράσεις πολιτισμού, ανοιχτά εργαστήρια και πρωτοβουλίες τεχνολογικής και κοινωνικής καινοτομίας του Δήμου. Γύρω του: γήπεδα μπάσκετ, πάρκο και παιδική χαρά.'
                }
            ]
        },
        en: {
            code: 'EXHIBIT #01',
            roomBadge: '🏙️ Room III: Modern Athens',
            title: 'Serafeio Complex',
            street: '144 Pireos St. & Petrou Ralli',
            walk: 'You are here • Starting Point',
            archTag: 'Sport, Culture & Innovation Centre',
            shortDesc: 'From Alkiviadis Serafis’ bequest for public baths and the 1960s swimming pool to the City of Athens’ centre for sport, culture and innovation, opened in 2017.',
            audioScript: 'Exhibit One, Modern Athens Room: the Serafeio on Pireos Street. It is named after Alkiviadis Serafis, who left the City of Athens money for public baths. A swimming pool was built here in the 1960s, and in 2017 today’s centre for sport, culture and innovation opened.',
            hotspots: [
                {
                    x: '26%', y: '44%',
                    type: 'THE NAME',
                    title: 'The Bequest of Alkiviadis Serafis',
                    text: 'In the late 1930s Alkiviadis Serafis left the City of Athens money in his will for public baths on a municipal plot, free for local residents. War and civil war followed, and the baths were never built.'
                },
                {
                    x: '68%', y: '35%',
                    type: 'HISTORICAL MILESTONE',
                    title: 'The Serafeio Swimming Pool',
                    text: 'In the 1960s a swimming pool named after the donor was built here instead of the baths. It closed after the 1999 earthquake. The new indoor pool, with 370 seats, opened in September 2017.'
                },
                {
                    x: '50%', y: '68%',
                    type: 'TODAY',
                    title: 'A Centre for Culture & Innovation',
                    text: 'The four-storey building on Petrou Ralli hosts the City’s cultural events, open workshops and technology and social innovation projects. Around it: basketball courts, a park and a playground.'
                }
            ]
        }
    },
    {
        id: 1,
        num: '#02',
        eraRoom: 'modern',
        year: '1857',
        coords: [37.9782, 23.7143],
        svgStyle: 'gazi',
        el: {
            code: 'ΕΚΘΕΜΑ #02',
            roomBadge: '🏙️ Δωμάτιο ΙΙΙ: Νεότερη & Σύγχρονη',
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
        eraRoom: 'modern',
        year: '1935',
        coords: [38.0008, 23.7378],
        svgStyle: 'agora',
        el: {
            code: 'ΕΚΘΕΜΑ #03',
            roomBadge: '🏙️ Δωμάτιο ΙΙΙ: Νεότερη & Σύγχρονη',
            title: 'Δημοτική Αγορά Κυψέλης',
            street: 'Φωκίωνος Νέγρη 42',
            walk: 'Αίθουσα ΙΙΙ • Μεσοπολεμική Αθήνα',
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
            title: 'Kypseli Municipal Market',
            street: '42 Fokionos Negri St.',
            walk: 'Room III • Interwar Athens',
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
        eraRoom: 'modern',
        year: '1933',
        coords: [37.98644, 23.73548],
        svgStyle: 'modernist',
        el: {
            code: 'ΕΚΘΕΜΑ #04',
            roomBadge: '🏙️ Δωμάτιο ΙΙΙ: Νεότερη & Σύγχρονη',
            title: 'Η Μπλε Πολυκατοικία (Εξάρχεια)',
            street: 'Αραχώβης 61 & Θεμιστοκλέους',
            walk: 'Αίθουσα ΙΙΙ • Μοντέρνα Αρχιτεκτονική',
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
            title: 'The Blue Apartment Building',
            street: '61 Arachovis & Themistokleous St.',
            walk: 'Room III • Modernist Architecture',
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
        eraRoom: 'modern',
        year: '1886',
        coords: [37.98037, 23.72762],
        svgStyle: 'agora',
        el: {
            code: 'ΕΚΘΕΜΑ #05',
            roomBadge: '🏙️ Δωμάτιο ΙΙΙ: Νεότερη & Σύγχρονη',
            title: 'Βαρβάκειος Κεντρική Αγορά',
            street: 'Οδός Αθηνάς 42',
            walk: 'Αίθουσα ΙΙΙ • Αθήνα του 19ου Αιώνα',
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
            title: 'Varvakeios Central Market',
            street: '42 Athinas St.',
            walk: 'Room III • 19th-Century Athens',
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
        eraRoom: 'modern',
        dualAncient: true,
        year: '479 π.Χ. / 1874',
        coords: [37.9818, 23.7278],
        svgStyle: 'neoclassical',
        el: {
            code: 'ΕΚΘΕΜΑ #06',
            roomBadge: '🏛️+🏙️ Γέφυρα Αρχαίας & Νεότερης Αθήνας',
            title: 'Δημαρχείο Αθηναίων & Αρχαία Αχαρνική Πύλη',
            street: 'Οδός Αθηνάς 63 (Πλ. Κοτζιά)',
            walk: 'Αίθουσα ΙΙΙ • Νεοκλασική Αθήνα',
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
            title: 'Athens City Hall & Ancient Acharnian Gate',
            street: '63 Athinas St. (Kotzia Sq.)',
            walk: 'Room III • Neoclassical Athens',
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
        eraRoom: 'ancient',
        year: '449 π.Χ.',
        coords: [37.9756, 23.7214],
        svgStyle: 'ancient_temple',
        el: {
            code: 'ΕΚΘΕΜΑ #07',
            roomBadge: '🏛️ Δωμάτιο Ι: Αρχαία Αθήνα',
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
        eraRoom: 'ancient',
        year: '1ος αι. π.Χ.',
        coords: [37.9742, 23.7270],
        svgStyle: 'ancient_tower',
        el: {
            code: 'ΕΚΘΕΜΑ #08',
            roomBadge: '🏛️ Δωμάτιο Ι: Αρχαία Αθήνα',
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
        eraRoom: 'byzantine',
        year: '1050 μ.Χ.',
        coords: [37.9763, 23.7286],
        svgStyle: 'byzantine_church',
        el: {
            code: 'ΕΚΘΕΜΑ #09',
            roomBadge: '☦️ Δωμάτιο ΙΙ: Βυζαντινή Αθήνα',
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
        eraRoom: 'byzantine',
        year: '11ος αι. μ.Χ.',
        coords: [37.97768, 23.72113],
        svgStyle: 'byzantine_church',
        el: {
            code: 'ΕΚΘΕΜΑ #10',
            roomBadge: '☦️ Δωμάτιο ΙΙ: Βυζαντινή Αθήνα',
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
        eraRoom: 'ancient',
        year: '447–432 π.Χ.',
        coords: [37.9715, 23.7267],
        svgStyle: 'parthenon',
        el: {
            code: 'ΕΚΘΕΜΑ #11',
            roomBadge: '🏛️ Δωμάτιο Ι: Αρχαία Αθήνα (Κορωνίδα)',
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
