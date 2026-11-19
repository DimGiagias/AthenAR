// 2D architectural illustrations of the 11 exhibits, per historical era.
import type { Exhibit } from '../../data/types';

export function render2dArchitecturalSvg(container: HTMLElement, exhibit: Exhibit, era: string): void {
    const eraBadge = era === '1900' ? '1900–1935 ARCHIVE' : (era === '1950' ? '1950–1975 ARCHIVE' : '2026 ATHENS');
    let buildingPaths = '';

    if (exhibit.id === 0) {
        // #01 SERAFEIO COMPLEX (1904 Stone Pavilions -> 1933 Pool -> 2026 Modern Bioclimatic Complex)
        const poolLayer = (era === '1950' || era === 'today') ? `
            <rect x="128" y="148" width="104" height="22" rx="4" fill="#38BDF8" fill-opacity="0.45" stroke="#0284C7" stroke-width="1.8"/>
            <line x1="145" y1="148" x2="145" y2="170" stroke="#0284C7" stroke-width="1" stroke-dasharray="2 2"/>
            <line x1="180" y1="148" x2="180" y2="170" stroke="#0284C7" stroke-width="1" stroke-dasharray="2 2"/>
            <line x1="215" y1="148" x2="215" y2="170" stroke="#0284C7" stroke-width="1" stroke-dasharray="2 2"/>
        ` : '';
        const modernWing = (era === 'today') ? `
            <rect x="195" y="72" width="115" height="72" rx="3" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
            <line x1="195" y1="84" x2="310" y2="84" stroke="#0284C7" stroke-width="2.5"/>
            <rect x="206" y="92" width="24" height="38" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.3"/>
            <rect x="238" y="92" width="24" height="38" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.3"/>
            <rect x="270" y="92" width="28" height="38" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.3"/>
        ` : '';
        buildingPaths = `
            ${modernWing}
            <!-- 1904 Stone Pavilion Left -->
            <polygon points="48,96 98,68 148,96" fill="#93C5FD" stroke="#0369A1" stroke-width="2.2"/>
            <rect x="54" y="96" width="88" height="68" fill="#FFFFFF" stroke="#0369A1" stroke-width="2.2"/>
            <path d="M68,140 V114 A8,8 0 0,1 84,114 V140 Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.6"/>
            <path d="M108,140 V114 A8,8 0 0,1 124,114 V140 Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.6"/>
            <rect x="89" y="132" width="18" height="32" fill="#BAE6FD" stroke="#0369A1" stroke-width="1.8"/>
            ${poolLayer}
        `;
    } else if (exhibit.svgStyle === 'gazi') {
        // #02 OLD GASWORKS (Twin Red-Brick Chimneys, Gasholder Lattice Frame, Clerestory Furnace Hall)
        const smokeSvg = (era === '1900' || era === '1950')
            ? `<circle cx="118" cy="30" r="9" fill="#94A3B8" opacity="0.5"/><circle cx="132" cy="19" r="13" fill="#CBD5E1" opacity="0.45"/><circle cx="248" cy="28" r="10" fill="#94A3B8" opacity="0.5"/>`
            : '';
        buildingPaths = `
            ${smokeSvg}
            <!-- Gasholder Steel Lattice & Bell -->
            <rect x="42" y="98" width="60" height="72" fill="none" stroke="#0369A1" stroke-width="1.6" stroke-dasharray="4 2"/>
            <path d="M46 170 V116 Q72 94 98 116 V170 Z" fill="#BAE6FD" fill-opacity="0.7" stroke="#0284C7" stroke-width="2"/>
            <line x1="42" y1="122" x2="102" y2="122" stroke="#0369A1" stroke-width="1.2"/>
            <line x1="42" y1="146" x2="102" y2="146" stroke="#0369A1" stroke-width="1.2"/>
            <!-- Twin Industrial Brick Chimneys -->
            <polygon points="110,170 113,44 125,44 128,170" fill="#0284C7" stroke="#0F172A" stroke-width="1.8"/>
            <rect x="110" y="40" width="18" height="5" fill="#0F172A"/>
            <polygon points="240,170 243,44 255,44 258,170" fill="#0284C7" stroke="#0F172A" stroke-width="1.8"/>
            <rect x="240" y="40" width="18" height="5" fill="#0F172A"/>
            <!-- Main Retort Furnace Hall -->
            <polygon points="132,110 184,78 236,110" fill="#38BDF8" fill-opacity="0.55" stroke="#0284C7" stroke-width="2.2"/>
            <rect x="136" y="110" width="96" height="60" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.4"/>
            <path d="M148,170 V132 A10,10 0 0,1 168,132 V170 Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.8"/>
            <path d="M174,170 V126 A10,10 0 0,1 194,126 V170 Z" fill="#38BDF8" fill-opacity="0.4" stroke="#0284C7" stroke-width="1.8"/>
            <path d="M200,170 V132 A10,10 0 0,1 220,132 V170 Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.8"/>
        `;
    } else if (exhibit.svgStyle === 'modernist') {
        // #04 BLUE APARTMENT BUILDING (Exarcheia - Cubist Erkers, Ribbon Windows, Rooftop Pergola)
        buildingPaths = `
            <!-- Rooftop Pergola ("Δώμα") -->
            <rect x="118" y="38" width="124" height="16" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.8"/>
            <line x1="138" y1="38" x2="138" y2="54" stroke="#0284C7" stroke-width="1.8"/>
            <line x1="180" y1="38" x2="180" y2="54" stroke="#0284C7" stroke-width="1.8"/>
            <line x1="222" y1="38" x2="222" y2="54" stroke="#0284C7" stroke-width="1.8"/>
            <!-- Main Papaloukas Cobalt Facade -->
            <rect x="78" y="54" width="204" height="116" rx="3" fill="#0284C7" stroke="#0F172A" stroke-width="2.2"/>
            <!-- Protruding Modernist Erker Volumes -->
            <rect x="92" y="64" width="80" height="84" fill="#EFF6FF" stroke="#0F172A" stroke-width="1.8"/>
            <rect x="188" y="64" width="80" height="84" fill="#EFF6FF" stroke="#0F172A" stroke-width="1.8"/>
            <!-- Bauhaus Horizontal Ribbon Windows -->
            <rect x="98" y="72" width="68" height="12" fill="#0284C7"/>
            <rect x="194" y="72" width="68" height="12" fill="#0284C7"/>
            <rect x="98" y="96" width="68" height="12" fill="#0284C7"/>
            <rect x="194" y="96" width="68" height="12" fill="#0284C7"/>
            <rect x="98" y="120" width="68" height="12" fill="#0284C7"/>
            <rect x="194" y="120" width="68" height="12" fill="#0284C7"/>
        `;
    } else if (exhibit.svgStyle === 'parthenon') {
        // #11 THE ACROPOLIS & PARTHENON (Octastyle 8-Column Doric Facade on the Sacred Rock)
        buildingPaths = `
            <!-- Sacred Rock of the Acropolis & Fortification Wall Base -->
            <polygon points="28,170 52,144 308,144 332,170" fill="#BAE6FD" stroke="#0369A1" stroke-width="2.2"/>
            <!-- 3-Stepped Pentelic Marble Crepidoma -->
            <rect x="48" y="136" width="264" height="8" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
            <!-- Parthenon Triangular Pediment & Sculpted Tympanum of Phidias -->
            <polygon points="46,66 180,22 314,66" fill="#E0F2FE" stroke="#0284C7" stroke-width="2.6"/>
            <polygon points="70,62 180,30 290,62" fill="#BAE6FD" stroke="#0369A1" stroke-width="1.6"/>
            <!-- Doric Entablature & Panathenaic Frieze -->
            <rect x="52" y="66" width="256" height="14" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.2"/>
            <!-- Octastyle (8-Column) Doric Facade -->
            <rect x="60"  y="80" width="13" height="56" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
            <rect x="92"  y="80" width="13" height="56" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
            <rect x="124" y="80" width="13" height="56" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
            <rect x="156" y="80" width="13" height="56" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
            <rect x="191" y="80" width="13" height="56" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
            <rect x="223" y="80" width="13" height="56" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
            <rect x="255" y="80" width="13" height="56" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
            <rect x="287" y="80" width="13" height="56" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
        `;
    } else if (exhibit.svgStyle === 'ancient_temple' || exhibit.svgStyle === 'ancient_tower') {
        // #07 TEMPLE OF HEPHAESTUS (DORIC PERIPTERAL) & #08 TOWER OF THE WINDS
        if (exhibit.svgStyle === 'ancient_tower') {
            buildingPaths = `
                <!-- Octagonal Pyramid Roof & Weathervane Base -->
                <polygon points="116,66 180,28 244,66" fill="#BAE6FD" stroke="#0284C7" stroke-width="2.4"/>
                <!-- Sculpted Frieze of the 8 Winged Winds -->
                <rect x="120" y="66" width="120" height="22" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
                <circle cx="144" cy="77" r="5" fill="#38BDF8"/>
                <circle cx="180" cy="77" r="5" fill="#0284C7"/>
                <circle cx="216" cy="77" r="5" fill="#38BDF8"/>
                <!-- Pentelic Marble Octagonal Shaft & Sundials -->
                <rect x="122" y="88" width="116" height="82" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.4"/>
                <line x1="154" y1="66" x2="154" y2="170" stroke="#0284C7" stroke-width="1.8"/>
                <line x1="206" y1="66" x2="206" y2="170" stroke="#0284C7" stroke-width="1.8"/>
                <!-- Corinthian Porch Entrance -->
                <rect x="164" y="130" width="32" height="40" fill="#BAE6FD" stroke="#0369A1" stroke-width="2"/>
            `;
        } else {
            buildingPaths = `
                <!-- Doric Triangular Pediment & Sculpted Tympanum -->
                <polygon points="56,74 180,28 304,74" fill="#E0F2FE" stroke="#0284C7" stroke-width="2.6"/>
                <polygon points="78,70 180,36 282,70" fill="#BAE6FD" stroke="#0369A1" stroke-width="1.5"/>
                <!-- Doric Entablature (Triglyphs & Metopes of Theseus) -->
                <rect x="64" y="74" width="232" height="16" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.2"/>
                <!-- 6 Front Doric Fluted Columns -->
                <rect x="74"  y="90" width="16" height="72" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
                <rect x="113" y="90" width="16" height="72" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
                <rect x="152" y="90" width="16" height="72" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
                <rect x="192" y="90" width="16" height="72" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
                <rect x="231" y="90" width="16" height="72" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
                <rect x="270" y="90" width="16" height="72" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
                <!-- 3-Step Marble Crepidoma (Stylobate) -->
                <rect x="54" y="162" width="252" height="8" fill="#BAE6FD" stroke="#0284C7" stroke-width="2"/>
            `;
        }
    } else if (exhibit.svgStyle === 'byzantine_church') {
        // #09 KAPNIKAREA & #10 AGIOI ASOMATOI (11th c. Byzantine Cloisonné & Octagonal Athenian Dome)
        buildingPaths = `
            <!-- Cross on Octagonal Athenian Dome -->
            <line x1="180" y1="18" x2="180" y2="34" stroke="#0284C7" stroke-width="2.5"/>
            <line x1="173" y1="24" x2="187" y2="24" stroke="#0284C7" stroke-width="2.5"/>
            <!-- Scalloped Terracotta Dome Roof -->
            <path d="M142,54 Q180,26 218,54 Z" fill="#38BDF8" stroke="#0284C7" stroke-width="2.2"/>
            <!-- Octagonal Drum with Arched Brick Windows -->
            <rect x="146" y="54" width="68" height="36" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.2"/>
            <path d="M156,86 V64 A6,6 0 0,1 168,64 V86 Z" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.6"/>
            <path d="M174,86 V64 A6,6 0 0,1 186,64 V86 Z" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.6"/>
            <path d="M192,86 V64 A6,6 0 0,1 204,64 V86 Z" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.6"/>
            <!-- Cruciform Gabled Transept & Cloisonné Body -->
            <polygon points="84,104 180,76 276,104" fill="#93C5FD" stroke="#0369A1" stroke-width="2.2"/>
            <rect x="92" y="104" width="176" height="66" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.4"/>
            <!-- Arched Byzantine Double-Light Windows (Δίλοβα Παράθυρα) & Narthex Portal -->
            <path d="M114,148 V120 A10,10 0 0,1 134,120 V148 Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.8"/>
            <path d="M226,148 V120 A10,10 0 0,1 246,120 V148 Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.8"/>
            <path d="M164,170 V126 A16,16 0 0,1 196,126 V170 Z" fill="#BAE6FD" stroke="#0369A1" stroke-width="2.2"/>
        `;
    } else if (exhibit.id === 2) {
        // #03 KYPSELI MUNICIPAL MARKET (1935 Art Deco Horizontal Arcade & Stepped Central Portal)
        buildingPaths = `
            <!-- Raised Clerestory Roof Monitor (Φωταγωγός Οροφής) -->
            <rect x="74" y="68" width="212" height="22" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
            <line x1="96" y1="68" x2="96" y2="90" stroke="#0284C7" stroke-width="1.5"/>
            <line x1="128" y1="68" x2="128" y2="90" stroke="#0284C7" stroke-width="1.5"/>
            <line x1="232" y1="68" x2="232" y2="90" stroke="#0284C7" stroke-width="1.5"/>
            <line x1="264" y1="68" x2="264" y2="90" stroke="#0284C7" stroke-width="1.5"/>
            <!-- Long Symmetrical Art Deco Facade Wings -->
            <rect x="38" y="90" width="284" height="80" rx="4" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.4"/>
            <!-- Continuous Cantilevered Modernist Canopy (Μαρκίζα) -->
            <rect x="32" y="114" width="296" height="7" rx="2" fill="#0284C7"/>
            <!-- Stepped Art Deco Central Entrance Portal -->
            <rect x="144" y="56" width="72" height="114" fill="#EFF6FF" stroke="#0369A1" stroke-width="2.4"/>
            <rect x="154" y="46" width="52" height="12" fill="#BAE6FD" stroke="#0284C7" stroke-width="2"/>
            <path d="M162,170 V112 A18,18 0 0,1 198,112 V170 Z" fill="#38BDF8" fill-opacity="0.35" stroke="#0284C7" stroke-width="2.2"/>
            <!-- Shopfront Bays Left & Right -->
            <rect x="50" y="126" width="24" height="44" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.6"/>
            <rect x="82" y="126" width="24" height="44" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.6"/>
            <rect x="114" y="126" width="22" height="44" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.6"/>
            <rect x="224" y="126" width="22" height="44" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.6"/>
            <rect x="254" y="126" width="24" height="44" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.6"/>
            <rect x="286" y="126" width="24" height="44" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.6"/>
        `;
    } else {
        // #05 VARVAKEIOS / #06 CITY HALL NEOCLASSICAL PALACE
        const thirdFloor = (exhibit.id === 5 && era === '1900') ? '' : `
            <rect x="64" y="64" width="232" height="32" fill="#EFF6FF" stroke="#0284C7" stroke-width="2.2"/>
            <rect x="78" y="72" width="16" height="18" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.4"/>
            <rect x="106" y="72" width="16" height="18" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.4"/>
            <rect x="238" y="72" width="16" height="18" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.4"/>
            <rect x="266" y="72" width="16" height="18" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.4"/>
        `;
        buildingPaths = `
            <!-- Symmetrical Wing Roofs & Central Classical Triangular Pediment -->
            <polygon points="60,64 120,44 180,64" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.8"/>
            <polygon points="180,64 240,44 300,64" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.8"/>
            <polygon points="124,64 180,26 236,64" fill="#BAE6FD" stroke="#0369A1" stroke-width="2.5"/>
            <circle cx="180" cy="48" r="6" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
            ${thirdFloor}
            <!-- Main Neoclassical Facade (Piano Nobile + Rusticated Ground Floor) -->
            <rect x="64" y="96" width="232" height="74" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.5"/>
            <line x1="64" y1="136" x2="296" y2="136" stroke="#0284C7" stroke-width="2"/>
            <!-- Wing Windows with Pediments -->
            <rect x="78" y="104" width="16" height="24" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>
            <rect x="106" y="104" width="16" height="24" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>
            <rect x="238" y="104" width="16" height="24" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>
            <rect x="266" y="104" width="16" height="24" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>
            <!-- 4 Central Classical Columns & Balcony -->
            <line x1="142" y1="64" x2="142" y2="136" stroke="#0369A1" stroke-width="4"/>
            <line x1="166" y1="64" x2="166" y2="136" stroke="#0369A1" stroke-width="4"/>
            <line x1="194" y1="64" x2="194" y2="136" stroke="#0369A1" stroke-width="4"/>
            <line x1="218" y1="64" x2="218" y2="136" stroke="#0369A1" stroke-width="4"/>
            <rect x="134" y="132" width="92" height="6" fill="#0284C7"/>
            <!-- 3 Arched Entrance Doors on Ground Floor -->
            <path d="M146,170 V148 A8,8 0 0,1 162,148 V170 Z" fill="#BAE6FD" stroke="#0369A1" stroke-width="1.8"/>
            <path d="M172,170 V146 A8,8 0 0,1 188,146 V170 Z" fill="#BAE6FD" stroke="#0369A1" stroke-width="1.8"/>
            <path d="M198,170 V148 A8,8 0 0,1 214,148 V170 Z" fill="#BAE6FD" stroke="#0369A1" stroke-width="1.8"/>
        `;
    }

    container.innerHTML = `
        <svg viewBox="0 0 360 220" class="w-full h-full">
            <defs>
                <linearGradient id="skyBackdropGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#DBEAFE" stop-opacity="0.6"/>
                    <stop offset="100%" stop-color="#F8FAFC" stop-opacity="0.1"/>
                </linearGradient>
            </defs>
            <rect width="360" height="170" fill="url(#skyBackdropGrad)"/>
            <rect x="24" y="170" width="312" height="4" rx="2" fill="#0284C7" opacity="0.45"/>
            ${buildingPaths}
            <text x="180" y="194" text-anchor="middle" fill="#0369A1" font-size="9" font-weight="800" letter-spacing="1.5">${eraBadge}</text>
        </svg>
    `;
}
