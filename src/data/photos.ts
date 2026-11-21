// Photos of the exhibits, bundled in public/exhibits/ so they work offline.
// Most are from Wikimedia Commons (free licences); Σεράφειο has none there, so
// its photo comes from the city's tourism site and is not freely licensed.
// The credit line is shown with the photo. Keyed by exhibit id.
export interface ExhibitPhoto {
    /** file name in public/exhibits/ */
    file: string;
    author: string;
    licence: string;
    /** the photo's Wikimedia Commons page */
    source: string;
}

export const exhibitPhotos: Partial<Record<number, ExhibitPhoto>> = {
    0: { file: "exhibit-01.jpg", author: "This is Athens", licence: "©", source: "https://www.thisisathens.org/acvb/index.php/meeting-planner/venues/serafio" },
    1: { file: "exhibit-02.jpg", author: "George E. Koronaios", licence: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Technopolis_(Gazi)_from_Ermou_Street_on_January_3,_2020.jpg" },
    2: { file: "exhibit-03.jpg", author: "Dimorsitanos", licence: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Agora.jpg" },
    3: { file: "exhibit-04.jpg", author: "Badseed", licence: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:%22Blue_condominium%22_in_Athens.jpg" },
    4: { file: "exhibit-05.jpg", author: "athenswalk", licence: "CC0", source: "https://commons.wikimedia.org/wiki/File:Central_Market_of_Athens.jpg" },
    5: { file: "exhibit-06.jpg", author: "George E. Koronaios", licence: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:The_City_Hall_of_Athens_on_June_8,_2021.jpg" },
    6: { file: "exhibit-07.jpg", author: "Jebulon", licence: "CC0", source: "https://commons.wikimedia.org/wiki/File:Temple_of_Hephaestus_from_ancient_agora_Athens.jpg" },
    7: { file: "exhibit-08.jpg", author: "Jakub Hałun", licence: "CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Tower_of_the_Winds,_Athens,_20240531_0913_9422.jpg" },
    8: { file: "exhibit-09.jpg", author: "Dimorsitanos", licence: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Kapnikarea.jpg" },
    9: { file: "exhibit-10.jpg", author: "Thaliapap", licence: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Agioi_Asomatoi_church.jpg" },
    10: { file: "exhibit-11.jpg", author: "Jebulon", licence: "CC0", source: "https://commons.wikimedia.org/wiki/File:Parthenon_east_side_Acropolis_Athens,_Greece.jpg" },
};
