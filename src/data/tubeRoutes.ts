// Simplified GeoJSON routes for London Underground lines
// Coordinates are [longitude, latitude] pairs tracing each line's path

export const TUBE_ROUTES: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { line: "Bakerloo", color: "#B36305" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.3353, 51.5925], // Harrow & Wealdstone
          [-0.3174, 51.5813], // Kenton
          [-0.3089, 51.5702], // South Kenton
          [-0.2979, 51.5627], // North Wembley
          [-0.2812, 51.5519], // Wembley Central
          [-0.2584, 51.5436], // Stonebridge Park
          [-0.2478, 51.5396], // Harlesden
          [-0.2389, 51.5343], // Willesden Junction
          [-0.2255, 51.5321], // Kensal Green
          [-0.2064, 51.5266], // Queen's Park
          [-0.1942, 51.5233], // Kilburn Park
          [-0.1855, 51.5225], // Maida Vale
          [-0.1744, 51.5235], // Warwick Avenue
          [-0.1835, 51.5213], // Paddington
          [-0.1714, 51.5154], // Edgware Road
          [-0.1601, 51.5224], // Marylebone
          [-0.1438, 51.5234], // Baker Street
          [-0.1439, 51.5226], // Regent's Park
          [-0.1418, 51.5152], // Oxford Circus
          [-0.1376, 51.5112], // Piccadilly Circus
          [-0.1246, 51.5085], // Charing Cross
          [-0.1148, 51.5031], // Waterloo
          [-0.1056, 51.4986], // Lambeth North
          [-0.0943, 51.4946], // Elephant & Castle
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Central", color: "#E32017" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.4384, 51.5152], // West Ruislip
          [-0.4216, 51.5107], // Ruislip Gardens
          [-0.3958, 51.5093], // South Ruislip
          [-0.3715, 51.5116], // Northolt
          [-0.3529, 51.5121], // Greenford
          [-0.3193, 51.5139], // Perivale
          [-0.2963, 51.5159], // Hanger Lane
          [-0.2836, 51.5168], // North Acton
          [-0.2603, 51.5170], // East Acton
          [-0.2434, 51.5097], // White City
          [-0.2247, 51.5047], // Shepherd's Bush
          [-0.2046, 51.5044], // Holland Park
          [-0.1922, 51.4999], // Notting Hill Gate
          [-0.1872, 51.5113], // Queensway
          [-0.1757, 51.5119], // Lancaster Gate
          [-0.1597, 51.5136], // Marble Arch
          [-0.1493, 51.5142], // Bond Street
          [-0.1418, 51.5152], // Oxford Circus
          [-0.1317, 51.5163], // Tottenham Court Road
          [-0.1219, 51.5166], // Holborn
          [-0.1120, 51.5168], // Chancery Lane
          [-0.1025, 51.5180], // St. Paul's
          [-0.0886, 51.5133], // Bank
          [-0.0766, 51.5151], // Liverpool Street
          [-0.0634, 51.5188], // Bethnal Green
          [-0.0465, 51.5211], // Mile End
          [-0.0350, 51.5270], // Stratford
          [-0.0120, 51.5370], // Leyton
          [0.0084, 51.5462], // Leytonstone
          [0.0208, 51.5590], // Snaresbrook
          [0.0285, 51.5757], // South Woodford
          [0.0434, 51.5879], // Woodford
          [0.0479, 51.6070], // Buckhurst Hill
          [0.0457, 51.6171], // Loughton
          [0.0477, 51.6318], // Debden
          [0.0471, 51.6455], // Theydon Bois
          [0.0540, 51.6717], // Epping
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Circle", color: "#FFD300" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.2252, 51.5143], // Hammersmith
          [-0.2101, 51.5091], // Goldhawk Road
          [-0.2003, 51.5058], // Shepherd's Bush Market
          [-0.2065, 51.4953], // Kensington (Olympia) - approximate
          [-0.1943, 51.5021], // Wood Lane
          [-0.1886, 51.5046], // Latimer Road
          [-0.1813, 51.5055], // Ladbroke Grove
          [-0.1745, 51.5074], // Westbourne Park
          [-0.1688, 51.5094], // Royal Oak
          [-0.1835, 51.5154], // Paddington
          [-0.1714, 51.5193], // Edgware Road
          [-0.1638, 51.5228], // Baker Street
          [-0.1553, 51.5255], // Great Portland Street
          [-0.1380, 51.5283], // Euston Square
          [-0.1246, 51.5300], // King's Cross
          [-0.1065, 51.5227], // Farringdon
          [-0.0943, 51.5185], // Barbican
          [-0.0884, 51.5200], // Moorgate
          [-0.0766, 51.5178], // Liverpool Street
          [-0.0743, 51.5137], // Aldgate
          [-0.0755, 51.5113], // Tower Hill
          [-0.0895, 51.5107], // Monument
          [-0.1005, 51.5119], // Cannon Street
          [-0.1039, 51.5117], // Mansion House
          [-0.1064, 51.5112], // Blackfriars
          [-0.1132, 51.5108], // Temple
          [-0.1196, 51.5104], // Embankment
          [-0.1246, 51.5010], // Westminster
          [-0.1340, 51.4945], // St. James's Park
          [-0.1444, 51.4965], // Victoria
          [-0.1564, 51.4945], // Sloane Square
          [-0.1714, 51.4917], // South Kensington
          [-0.1788, 51.4952], // Gloucester Road
          [-0.1945, 51.4990], // High Street Kensington
          [-0.1922, 51.4999], // Notting Hill Gate
          [-0.1872, 51.5070], // Bayswater
          [-0.1835, 51.5154], // Paddington
          [-0.1714, 51.5193], // Edgware Road
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "District", color: "#00782A" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.3525, 51.4749], // Richmond
          [-0.3252, 51.4768], // Kew Gardens
          [-0.2877, 51.4847], // Gunnersbury
          [-0.2670, 51.4905], // Turnham Green
          [-0.2534, 51.4942], // Chiswick Park
          [-0.2452, 51.4956], // Acton Town
          [-0.2362, 51.4945], // Ealing Common
          [-0.2252, 51.5020], // Hammersmith (approx via Ravenscourt)
          [-0.2252, 51.5143], // Hammersmith
          [-0.2101, 51.5091], // Goldhawk Road approach
          [-0.1943, 51.5021], // Barons Court area
          [-0.1886, 51.4910], // West Kensington
          [-0.1850, 51.4875], // Fulham Broadway area
          [-0.1813, 51.4815], // Parsons Green
          [-0.1772, 51.4752], // Putney Bridge
          [-0.1963, 51.4685], // East Putney
          [-0.2090, 51.4624], // Southfields
          [-0.2138, 51.4511], // Wimbledon Park
          [-0.2055, 51.4213], // Wimbledon
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "District", color: "#00782A" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.2252, 51.5143], // Hammersmith
          [-0.1943, 51.5021], // Barons Court area
          [-0.1886, 51.4910], // West Kensington
          [-0.1945, 51.4990], // High Street Kensington
          [-0.1714, 51.4917], // South Kensington
          [-0.1788, 51.4952], // Gloucester Road
          [-0.1564, 51.4945], // Sloane Square
          [-0.1444, 51.4965], // Victoria
          [-0.1340, 51.4945], // St. James's Park
          [-0.1246, 51.5010], // Westminster
          [-0.1196, 51.5104], // Embankment
          [-0.1132, 51.5108], // Temple
          [-0.1064, 51.5112], // Blackfriars
          [-0.1039, 51.5117], // Mansion House
          [-0.1005, 51.5119], // Cannon Street
          [-0.0895, 51.5107], // Monument
          [-0.0755, 51.5113], // Tower Hill
          [-0.0566, 51.5104], // Whitechapel
          [-0.0425, 51.5095], // Stepney Green
          [-0.0350, 51.5070], // Mile End
          [-0.0253, 51.5049], // Bow Road
          [-0.0115, 51.5087], // Bromley-by-Bow
          [-0.0005, 51.5124], // West Ham
          [0.0085, 51.5186], // Plaistow
          [0.0173, 51.5215], // Upton Park
          [0.0278, 51.5247], // East Ham
          [0.0389, 51.5282], // Barking
          [0.0602, 51.5396], // Upminster area
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Elizabeth line", color: "#6950A1" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.4484, 51.5152], // West Drayton area
          [-0.4060, 51.5085], // Hayes
          [-0.3715, 51.5066], // Southall
          [-0.3193, 51.5074], // Hanwell
          [-0.2762, 51.5085], // West Ealing
          [-0.2596, 51.5140], // Ealing Broadway
          [-0.2452, 51.5088], // Acton Main Line
          [-0.2247, 51.5047], // Shepherd's Bush (Overground area)
          [-0.1835, 51.5181], // Paddington
          [-0.1493, 51.5142], // Bond Street
          [-0.1317, 51.5163], // Tottenham Court Road
          [-0.1065, 51.5186], // Farringdon
          [-0.0766, 51.5178], // Liverpool Street
          [-0.0566, 51.5104], // Whitechapel
          [-0.0236, 51.5054], // Canary Wharf (Crossrail)
          [0.0085, 51.5086], // Custom House
          [0.0282, 51.5068], // Woolwich (Crossrail)
          [0.0562, 51.5045], // Abbey Wood
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Hammersmith & City", color: "#F3A9BB" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.2252, 51.5143], // Hammersmith
          [-0.2101, 51.5091], // Goldhawk Road
          [-0.2003, 51.5058], // Shepherd's Bush Market
          [-0.1943, 51.5021], // Wood Lane
          [-0.1886, 51.5046], // Latimer Road
          [-0.1813, 51.5055], // Ladbroke Grove
          [-0.1745, 51.5074], // Westbourne Park
          [-0.1688, 51.5094], // Royal Oak
          [-0.1835, 51.5154], // Paddington
          [-0.1714, 51.5193], // Edgware Road
          [-0.1638, 51.5228], // Baker Street
          [-0.1553, 51.5255], // Great Portland Street
          [-0.1380, 51.5283], // Euston Square
          [-0.1246, 51.5300], // King's Cross
          [-0.1065, 51.5227], // Farringdon
          [-0.0943, 51.5185], // Barbican
          [-0.0884, 51.5200], // Moorgate
          [-0.0766, 51.5178], // Liverpool Street
          [-0.0743, 51.5137], // Aldgate East
          [-0.0566, 51.5104], // Whitechapel
          [-0.0425, 51.5095], // Stepney Green
          [-0.0350, 51.5070], // Mile End
          [-0.0253, 51.5049], // Bow Road
          [-0.0115, 51.5087], // Bromley-by-Bow
          [-0.0005, 51.5124], // West Ham
          [0.0085, 51.5186], // Plaistow
          [0.0173, 51.5215], // Upton Park
          [0.0278, 51.5247], // East Ham
          [0.0389, 51.5282], // Barking
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Jubilee", color: "#A0A5A9" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.2803, 51.5472], // Stanmore area
          [-0.2757, 51.5395], // Canons Park
          [-0.2644, 51.5321], // Queensbury
          [-0.2496, 51.5258], // Kingsbury
          [-0.2274, 51.5300], // Wembley Park
          [-0.2042, 51.5365], // Neasden
          [-0.1954, 51.5499], // Dollis Hill
          [-0.1942, 51.5521], // Willesden Green
          [-0.1883, 51.5567], // Kilburn
          [-0.1796, 51.5465], // West Hampstead
          [-0.1742, 51.5431], // Finchley Road
          [-0.1585, 51.5359], // Swiss Cottage
          [-0.1745, 51.5266], // St. John's Wood
          [-0.1638, 51.5228], // Baker Street
          [-0.1493, 51.5142], // Bond Street
          [-0.1342, 51.5070], // Green Park
          [-0.1246, 51.5010], // Westminster
          [-0.1132, 51.5031], // Waterloo
          [-0.1068, 51.5040], // Southwark
          [-0.0968, 51.5039], // London Bridge
          [-0.0876, 51.5049], // Bermondsey
          [-0.0496, 51.4999], // Canada Water
          [-0.0236, 51.5054], // Canary Wharf
          [-0.0101, 51.5076], // North Greenwich
          [0.0039, 51.5029], // Canning Town
          [0.0085, 51.5124], // West Ham
          [0.0368, 51.5312], // Stratford
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Metropolitan", color: "#9B0056" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.6076, 51.6679], // Chesham area
          [-0.5609, 51.6543], // Amersham area
          [-0.5109, 51.6397], // Chalfont & Latimer
          [-0.4732, 51.6114], // Chorleywood
          [-0.4341, 51.5866], // Rickmansworth
          [-0.4173, 51.5721], // Moor Park
          [-0.3960, 51.5664], // Northwood
          [-0.3820, 51.5555], // Northwood Hills
          [-0.3707, 51.5465], // Pinner
          [-0.3570, 51.5382], // North Harrow
          [-0.3353, 51.5925], // Harrow-on-the-Hill via branch
          [-0.3353, 51.5718], // Harrow-on-the-Hill
          [-0.3175, 51.5627], // Northwick Park
          [-0.2967, 51.5522], // Preston Road
          [-0.2274, 51.5300], // Wembley Park
          [-0.2042, 51.5365], // Finchley Road area
          [-0.1742, 51.5431], // Finchley Road
          [-0.1638, 51.5228], // Baker Street
          [-0.1553, 51.5255], // Great Portland Street
          [-0.1380, 51.5283], // Euston Square
          [-0.1246, 51.5300], // King's Cross
          [-0.1065, 51.5227], // Farringdon
          [-0.0943, 51.5185], // Barbican
          [-0.0884, 51.5200], // Moorgate
          [-0.0766, 51.5178], // Liverpool Street
          [-0.0743, 51.5137], // Aldgate
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Northern", color: "#000000" },
      geometry: {
        type: "LineString",
        coordinates: [
          // High Barnet branch
          [-0.1940, 51.6503], // High Barnet
          [-0.1880, 51.6416], // Totteridge
          [-0.1801, 51.6302], // Woodside Park
          [-0.1730, 51.6178], // West Finchley
          [-0.1744, 51.6093], // Finchley Central
          [-0.1766, 51.6002], // East Finchley
          [-0.1647, 51.5874], // Highgate
          [-0.1456, 51.5777], // Archway
          [-0.1396, 51.5679], // Tufnell Park
          [-0.1377, 51.5546], // Kentish Town
          [-0.1428, 51.5488], // Camden Town
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Northern", color: "#000000" },
      geometry: {
        type: "LineString",
        coordinates: [
          // Edgware branch
          [-0.2750, 51.6137], // Edgware
          [-0.2615, 51.6071], // Burnt Oak
          [-0.2495, 51.5986], // Colindale
          [-0.2269, 51.5895], // Hendon Central
          [-0.2097, 51.5808], // Brent Cross
          [-0.1952, 51.5765], // Golders Green
          [-0.1799, 51.5568], // Hampstead
          [-0.1670, 51.5509], // Belsize Park
          [-0.1643, 51.5445], // Chalk Farm
          [-0.1428, 51.5488], // Camden Town
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Northern", color: "#000000" },
      geometry: {
        type: "LineString",
        coordinates: [
          // Camden Town to south via Charing Cross branch
          [-0.1428, 51.5488], // Camden Town
          [-0.1384, 51.5347], // Mornington Crescent
          [-0.1318, 51.5285], // Euston
          [-0.1244, 51.5226], // Warren Street
          [-0.1306, 51.5158], // Goodge Street
          [-0.1317, 51.5163], // Tottenham Court Road
          [-0.1277, 51.5087], // Leicester Square
          [-0.1246, 51.5085], // Charing Cross
          [-0.1196, 51.5068], // Embankment
          [-0.1132, 51.5031], // Waterloo
          [-0.1005, 51.4982], // Kennington
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Northern", color: "#000000" },
      geometry: {
        type: "LineString",
        coordinates: [
          // Camden Town to south via Bank branch
          [-0.1428, 51.5488], // Camden Town
          [-0.1318, 51.5285], // Euston
          [-0.1246, 51.5300], // King's Cross
          [-0.1058, 51.5206], // Angel
          [-0.0887, 51.5256], // Old Street
          [-0.0884, 51.5200], // Moorgate
          [-0.0886, 51.5133], // Bank
          [-0.0968, 51.5039], // London Bridge
          [-0.0891, 51.4957], // Borough
          [-0.0943, 51.4946], // Elephant & Castle
          [-0.1005, 51.4982], // Kennington
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Northern", color: "#000000" },
      geometry: {
        type: "LineString",
        coordinates: [
          // South from Kennington
          [-0.1005, 51.4982], // Kennington
          [-0.1019, 51.4901], // Oval
          [-0.1107, 51.4820], // Stockwell
          [-0.1148, 51.4714], // Clapham North
          [-0.1190, 51.4627], // Clapham Common
          [-0.1260, 51.4527], // Clapham South
          [-0.1315, 51.4432], // Balham
          [-0.1404, 51.4279], // Tooting Bec
          [-0.1498, 51.4173], // Tooting Broadway
          [-0.1527, 51.4025], // Colliers Wood
          [-0.1541, 51.3925], // South Wimbledon
          [-0.1734, 51.3873], // Morden
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Piccadilly", color: "#003688" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.4876, 51.4713], // Heathrow T2/3
          [-0.4525, 51.4590], // Hatton Cross
          [-0.3858, 51.4669], // Hounslow West/East
          [-0.3598, 51.4731], // Osterley
          [-0.3246, 51.4821], // Boston Manor
          [-0.3093, 51.4951], // Northfields
          [-0.2884, 51.5015], // South Ealing
          [-0.2452, 51.5025], // Acton Town
          [-0.2177, 51.4930], // Hammersmith (Picc)
          [-0.2131, 51.4916], // Barons Court
          [-0.1990, 51.4903], // Earl's Court
          [-0.1788, 51.4952], // Gloucester Road
          [-0.1714, 51.4917], // South Kensington
          [-0.1613, 51.4949], // Knightsbridge
          [-0.1539, 51.5027], // Hyde Park Corner
          [-0.1342, 51.5070], // Green Park
          [-0.1376, 51.5112], // Piccadilly Circus
          [-0.1277, 51.5087], // Leicester Square
          [-0.1221, 51.5074], // Covent Garden
          [-0.1219, 51.5166], // Holborn
          [-0.1120, 51.5205], // Russell Square
          [-0.1246, 51.5300], // King's Cross
          [-0.1080, 51.5486], // Caledonian Road
          [-0.1065, 51.5570], // Holloway Road
          [-0.1058, 51.5651], // Arsenal
          [-0.0990, 51.5837], // Finsbury Park
          [-0.0882, 51.5898], // Manor House
          [-0.0758, 51.5922], // Turnpike Lane
          [-0.0659, 51.5887], // Wood Green
          [-0.0586, 51.5849], // Bounds Green
          [-0.0476, 51.5819], // Arnos Grove
          [-0.0392, 51.5826], // Southgate
          [-0.0333, 51.5814], // Oakwood
          [-0.0280, 51.5821], // Cockfosters
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "Victoria", color: "#0098D4" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.0915, 51.5856], // Walthamstow Central
          [-0.0791, 51.5826], // Blackhorse Road
          [-0.0596, 51.5882], // Tottenham Hale
          [-0.0656, 51.5765], // Seven Sisters
          [-0.0990, 51.5837], // Finsbury Park
          [-0.1047, 51.5640], // Highbury & Islington
          [-0.1058, 51.5506], // King's Cross St. Pancras area
          [-0.1318, 51.5285], // Euston
          [-0.1244, 51.5226], // Warren Street
          [-0.1418, 51.5152], // Oxford Circus
          [-0.1342, 51.5070], // Green Park
          [-0.1444, 51.4965], // Victoria
          [-0.1444, 51.4891], // Pimlico
          [-0.1226, 51.4861], // Vauxhall
          [-0.1107, 51.4820], // Stockwell
          [-0.1052, 51.4728], // Brixton
        ],
      },
    },

    // ===================== DLR =====================
    {
      type: "Feature",
      properties: { line: "DLR", color: "#00A4A7" },
      geometry: {
        type: "LineString",
        coordinates: [
          // Bank to Lewisham
          [-0.0886, 51.5133], // Bank
          [-0.0755, 51.5113], // Tower Gateway area
          [-0.0662, 51.5089], // Shadwell
          [-0.0477, 51.5087], // Limehouse
          [-0.0325, 51.5095], // Westferry
          [-0.0236, 51.5054], // Canary Wharf (Heron Quays)
          [-0.0189, 51.5000], // South Quay
          [-0.0147, 51.4963], // Crossharbour
          [-0.0094, 51.4906], // Mudchute
          [-0.0078, 51.4846], // Island Gardens
          [-0.0142, 51.4778], // Cutty Sark
          [-0.0133, 51.4735], // Greenwich
          [-0.0150, 51.4680], // Deptford Bridge
          [-0.0224, 51.4612], // Elverson Road
          [-0.0141, 51.4530], // Lewisham
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "DLR", color: "#00A4A7" },
      geometry: {
        type: "LineString",
        coordinates: [
          // Tower Gateway to Beckton
          [-0.0755, 51.5113], // Tower Gateway
          [-0.0662, 51.5089], // Shadwell
          [-0.0477, 51.5087], // Limehouse
          [-0.0325, 51.5095], // Westferry
          [-0.0261, 51.5107], // Poplar
          [-0.0166, 51.5094], // Blackwall
          [-0.0058, 51.5099], // East India
          [0.0039, 51.5029], // Canning Town
          [0.0120, 51.5090], // Royal Victoria
          [0.0175, 51.5108], // Custom House
          [0.0225, 51.5101], // Prince Regent
          [0.0290, 51.5088], // Royal Albert
          [0.0478, 51.5067], // Beckton Park
          [0.0548, 51.5044], // Cyprus
          [0.0615, 51.5032], // Gallions Reach
          [0.0660, 51.5013], // Beckton
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "DLR", color: "#00A4A7" },
      geometry: {
        type: "LineString",
        coordinates: [
          // Stratford to Canary Wharf via Poplar
          [-0.0350, 51.5412], // Stratford International
          [-0.0350, 51.5270], // Stratford
          [-0.0115, 51.5317], // Star Lane area
          [-0.0058, 51.5250], // Abbey Road (DLR)
          [-0.0005, 51.5190], // West Ham area
          [0.0039, 51.5120], // Canning Town
          [-0.0058, 51.5099], // East India
          [-0.0166, 51.5094], // Blackwall
          [-0.0261, 51.5107], // Poplar
          [-0.0236, 51.5054], // Canary Wharf
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "DLR", color: "#00A4A7" },
      geometry: {
        type: "LineString",
        coordinates: [
          // Royal Albert to Woolwich Arsenal branch
          [0.0290, 51.5088], // Royal Albert
          [0.0355, 51.5036], // King George V
          [0.0714, 51.4905], // Woolwich Arsenal
        ],
      },
    },

    // ===================== LONDON OVERGROUND =====================
    // Lioness line (Watford Junction - Euston)
    {
      type: "Feature",
      properties: { line: "Lioness", color: "#FFD200" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.3963, 51.6636], // Watford Junction
          [-0.3857, 51.6573], // Watford High Street
          [-0.3633, 51.6467], // Bushey
          [-0.3420, 51.6288], // Carpenders Park
          [-0.3215, 51.6124], // Hatch End
          [-0.3100, 51.5985], // Headstone Lane
          [-0.3353, 51.5718], // Harrow & Wealdstone
          [-0.3174, 51.5813], // Kenton
          [-0.3089, 51.5702], // South Kenton
          [-0.2979, 51.5627], // North Wembley
          [-0.2812, 51.5519], // Wembley Central
          [-0.2584, 51.5436], // Stonebridge Park
          [-0.2478, 51.5396], // Harlesden
          [-0.2389, 51.5343], // Willesden Junction
          [-0.2255, 51.5321], // Kensal Green
          [-0.2064, 51.5266], // Queen's Park
          [-0.1942, 51.5233], // Kilburn High Road
          [-0.1768, 51.5322], // South Hampstead
          [-0.1318, 51.5285], // Euston
        ],
      },
    },
    // Mildmay line (Stratford - Richmond/Clapham Junction)
    {
      type: "Feature",
      properties: { line: "Mildmay", color: "#005ABA" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.0350, 51.5412], // Stratford
          [-0.0564, 51.5463], // Hackney Wick
          [-0.0558, 51.5535], // Homerton
          [-0.0569, 51.5579], // Hackney Central
          [-0.0751, 51.5612], // Dalston Kingsland
          [-0.0826, 51.5656], // Canonbury
          [-0.1047, 51.5640], // Highbury & Islington
          [-0.1146, 51.5539], // Caledonian Road & Barnsbury
          [-0.1416, 51.5451], // Camden Road
          [-0.1683, 51.5397], // Kentish Town West
          [-0.1850, 51.5377], // Gospel Oak
          [-0.1960, 51.5430], // Hampstead Heath
          [-0.2088, 51.5418], // Finchley Road & Frognal
          [-0.1796, 51.5465], // West Hampstead
          [-0.2138, 51.5324], // Brondesbury
          [-0.2186, 51.5285], // Brondesbury Park
          [-0.2255, 51.5251], // Kensal Rise
          [-0.2389, 51.5343], // Willesden Junction
          [-0.2528, 51.5321], // Acton Central
          [-0.2717, 51.5072], // South Acton
          [-0.2877, 51.4847], // Gunnersbury
          [-0.2877, 51.4775], // Kew Gardens
          [-0.3013, 51.4641], // Richmond
        ],
      },
    },
    // Mildmay line - Clapham Junction branch
    {
      type: "Feature",
      properties: { line: "Mildmay", color: "#005ABA" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.1047, 51.5640], // Highbury & Islington
          [-0.1146, 51.5539], // Caledonian Road & Barnsbury
          [-0.1416, 51.5451], // Camden Road
          [-0.1683, 51.5397], // Kentish Town West
          [-0.1850, 51.5377], // Gospel Oak
          [-0.1960, 51.5430], // Hampstead Heath
          [-0.2088, 51.5418], // Finchley Road & Frognal
          [-0.1796, 51.5465], // West Hampstead
          [-0.2186, 51.5285], // Brondesbury Park
          [-0.2255, 51.5251], // Kensal Rise
          [-0.2389, 51.5343], // Willesden Junction
          [-0.2275, 51.5003], // Shepherd's Bush
          [-0.2095, 51.4942], // Kensington (Olympia)
          [-0.1964, 51.4819], // West Brompton
          [-0.1702, 51.4621], // Imperial Wharf
          [-0.1700, 51.4641], // Clapham Junction
        ],
      },
    },
    // Windrush line (Highbury & Islington - Crystal Palace/West Croydon)
    {
      type: "Feature",
      properties: { line: "Windrush", color: "#E21836" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.1047, 51.5640], // Highbury & Islington
          [-0.0826, 51.5656], // Canonbury
          [-0.0751, 51.5612], // Dalston Junction
          [-0.0643, 51.5497], // Haggerston
          [-0.0578, 51.5443], // Hoxton
          [-0.0480, 51.5324], // Shoreditch High Street
          [-0.0566, 51.5104], // Whitechapel
          [-0.0662, 51.5089], // Shadwell
          [-0.0543, 51.5012], // Wapping
          [-0.0476, 51.4990], // Rotherhithe
          [-0.0496, 51.4929], // Canada Water
          [-0.0545, 51.4838], // Surrey Quays
          [-0.0754, 51.4702], // Queens Road Peckham
          [-0.0775, 51.4551], // Peckham Rye
          [-0.0739, 51.4424], // East Dulwich
          [-0.0651, 51.4327], // North Dulwich / Honor Oak area
          [-0.0568, 51.4209], // Forest Hill
          [-0.0536, 51.4180], // Sydenham
          [-0.0720, 51.4078], // Crystal Palace
        ],
      },
    },
    // Windrush - West Croydon branch
    {
      type: "Feature",
      properties: { line: "Windrush", color: "#E21836" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.0536, 51.4180], // Sydenham
          [-0.0450, 51.4076], // Penge West
          [-0.0415, 51.3963], // Anerley
          [-0.0530, 51.3823], // Norwood Junction
          [-0.0656, 51.3758], // West Croydon
        ],
      },
    },
    // Weaver line (Liverpool Street - Cheshunt/Enfield Town/Chingford)
    {
      type: "Feature",
      properties: { line: "Weaver", color: "#7B2D8B" },
      geometry: {
        type: "LineString",
        coordinates: [
          // Liverpool St to Cheshunt via Tottenham Hale
          [-0.0766, 51.5178], // Liverpool Street
          [-0.0726, 51.5270], // Bethnal Green area
          [-0.0569, 51.5413], // London Fields
          [-0.0569, 51.5479], // Hackney Downs
          [-0.0674, 51.5580], // Rectory Road
          [-0.0727, 51.5604], // Stoke Newington
          [-0.0792, 51.5703], // Stamford Hill
          [-0.0652, 51.5774], // Seven Sisters
          [-0.0596, 51.5882], // Tottenham Hale
          [-0.0538, 51.6055], // Northumberland Park
          [-0.0380, 51.6266], // Ponders End area
          [-0.0440, 51.6391], // Enfield Lock
          [-0.0332, 51.6527], // Waltham Cross
          [-0.0250, 51.6630], // Cheshunt
        ],
      },
    },
    // Weaver - Enfield Town branch
    {
      type: "Feature",
      properties: { line: "Weaver", color: "#7B2D8B" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.0569, 51.5479], // Hackney Downs
          [-0.0652, 51.5677], // Stoke Newington area
          [-0.0785, 51.5854], // South Tottenham area
          [-0.0655, 51.6034], // Bruce Grove
          [-0.0592, 51.6175], // White Hart Lane
          [-0.0547, 51.6310], // Silver Street
          [-0.0625, 51.6438], // Edmonton Green
          [-0.0782, 51.6478], // Bush Hill Park
          [-0.0797, 51.6517], // Enfield Town
        ],
      },
    },
    // Weaver - Chingford branch
    {
      type: "Feature",
      properties: { line: "Weaver", color: "#7B2D8B" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.0569, 51.5479], // Hackney Downs
          [-0.0473, 51.5558], // Clapton
          [-0.0384, 51.5682], // St James Street
          [-0.0306, 51.5820], // Walthamstow Central area
          [-0.0195, 51.5892], // Wood Street
          [-0.0099, 51.6043], // Highams Park
          [-0.0060, 51.6248], // Chingford
        ],
      },
    },
    // Suffragette line (Gospel Oak - Barking Riverside)
    {
      type: "Feature",
      properties: { line: "Suffragette", color: "#00A170" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.1850, 51.5377], // Gospel Oak
          [-0.1579, 51.5393], // Upper Holloway
          [-0.1285, 51.5460], // Crouch Hill
          [-0.1035, 51.5502], // Harringay Green Lanes
          [-0.0792, 51.5614], // South Tottenham
          [-0.0791, 51.5826], // Blackhorse Road
          [-0.0566, 51.5875], // Walthamstow Queen's Road
          [-0.0382, 51.5840], // Leyton Midland Road
          [-0.0208, 51.5655], // Leytonstone High Road
          [-0.0048, 51.5526], // Wanstead Park
          [0.0166, 51.5448], // Woodgrange Park
          [0.0389, 51.5282], // Barking
          [0.0800, 51.5120], // Barking Riverside
        ],
      },
    },

    // ===================== THAMESLINK =====================
    {
      type: "Feature",
      properties: { line: "Thameslink", color: "#D693C2" },
      geometry: {
        type: "LineString",
        coordinates: [
          // St Albans / Luton direction to Brighton direction through core
          [-0.2155, 51.7497], // St Albans City
          [-0.2131, 51.7135], // Radlett area
          [-0.1900, 51.6915], // Elstree & Borehamwood
          [-0.1736, 51.6593], // Mill Hill Broadway
          [-0.2097, 51.6145], // Hendon
          [-0.2027, 51.5984], // Cricklewood
          [-0.1796, 51.5465], // West Hampstead (Thameslink)
          [-0.1640, 51.5343], // Kentish Town (area)
          [-0.1318, 51.5305], // St Pancras International
          [-0.1065, 51.5227], // Farringdon
          [-0.1034, 51.5149], // City Thameslink
          [-0.1064, 51.5112], // Blackfriars
          [-0.0943, 51.4946], // Elephant & Castle
          [-0.1002, 51.4703], // Loughborough Junction
          [-0.0860, 51.4670], // Herne Hill
          [-0.0826, 51.4460], // Tulse Hill
          [-0.0779, 51.4310], // Streatham area
          [-0.1125, 51.3825], // Mitcham Eastfields area
          [-0.1406, 51.3641], // Sutton area (approximate)
        ],
      },
    },
    // Thameslink - London Bridge branch south
    {
      type: "Feature",
      properties: { line: "Thameslink", color: "#D693C2" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.1064, 51.5112], // Blackfriars
          [-0.0968, 51.5039], // London Bridge
          [-0.0741, 51.4741], // South Bermondsey
          [-0.0775, 51.4551], // Peckham Rye area
          [-0.0826, 51.4460], // Tulse Hill merge
        ],
      },
    },

    // ===================== SOUTHERN =====================
    // Victoria to Brixton / Clapham area to Crystal Palace & beyond
    {
      type: "Feature",
      properties: { line: "Southern", color: "#8CC63F" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.1444, 51.4965], // Victoria
          [-0.1444, 51.4891], // Pimlico area
          [-0.1502, 51.4746], // Battersea Park
          [-0.1700, 51.4641], // Clapham Junction
          [-0.1513, 51.4537], // Wandsworth Common
          [-0.1315, 51.4432], // Balham
          [-0.1158, 51.4289], // Streatham Hill
          [-0.0860, 51.4135], // West Norwood
          [-0.0568, 51.4209], // Forest Hill area
          [-0.0536, 51.4180], // Sydenham
          [-0.0720, 51.4078], // Crystal Palace
          [-0.0530, 51.3823], // Norwood Junction
          [-0.0656, 51.3758], // West Croydon
          [-0.0924, 51.3727], // East Croydon
        ],
      },
    },
    // Southern - London Bridge branch
    {
      type: "Feature",
      properties: { line: "Southern", color: "#8CC63F" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.0968, 51.5039], // London Bridge
          [-0.0741, 51.4741], // South Bermondsey area
          [-0.0530, 51.3823], // Norwood Junction area
          [-0.0924, 51.3727], // East Croydon
          [-0.1086, 51.3516], // South Croydon
          [-0.1212, 51.3295], // Purley
          [-0.1406, 51.2952], // Coulsdon
        ],
      },
    },

    // ===================== SOUTHEASTERN =====================
    // London Bridge / Charing Cross to Southeast London
    {
      type: "Feature",
      properties: { line: "Southeastern", color: "#00AEEF" },
      geometry: {
        type: "LineString",
        coordinates: [
          // Charing Cross to Lewisham and beyond
          [-0.1246, 51.5085], // Charing Cross
          [-0.1132, 51.5031], // Waterloo East
          [-0.0968, 51.5039], // London Bridge
          [-0.0370, 51.4770], // New Cross
          [-0.0259, 51.4728], // St Johns
          [-0.0141, 51.4530], // Lewisham
          [0.0014, 51.4525], // Blackheath
          [0.0188, 51.4532], // Kidbrooke
          [0.0360, 51.4515], // Eltham
          [0.0699, 51.4420], // Sidcup area
        ],
      },
    },
    // Southeastern - Greenwich line
    {
      type: "Feature",
      properties: { line: "Southeastern", color: "#00AEEF" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.0968, 51.5039], // London Bridge
          [-0.0541, 51.4838], // Deptford area
          [-0.0133, 51.4778], // Greenwich
          [-0.0008, 51.4732], // Maze Hill
          [0.0146, 51.4838], // Westcombe Park
          [0.0296, 51.4798], // Charlton
          [0.0519, 51.4894], // Woolwich Dockyard
          [0.0714, 51.4905], // Woolwich Arsenal
          [0.0920, 51.4898], // Plumstead
          [0.1185, 51.4915], // Abbey Wood area
        ],
      },
    },

    // ===================== SOUTH WESTERN RAILWAY =====================
    {
      type: "Feature",
      properties: { line: "South Western", color: "#E11B22" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.1132, 51.5031], // Waterloo
          [-0.1226, 51.4861], // Vauxhall
          [-0.1568, 51.4726], // Queenstown Road
          [-0.1700, 51.4641], // Clapham Junction
          [-0.1953, 51.4595], // Earlsfield
          [-0.2055, 51.4413], // Wimbledon
          [-0.2342, 51.4162], // Raynes Park
          [-0.2598, 51.3991], // New Malden area
          [-0.2986, 51.3927], // Kingston area
          [-0.3396, 51.3842], // Surbiton
        ],
      },
    },
    // SWR - Richmond branch
    {
      type: "Feature",
      properties: { line: "South Western", color: "#E11B22" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.1132, 51.5031], // Waterloo
          [-0.1226, 51.4861], // Vauxhall
          [-0.1568, 51.4726], // Queenstown Road
          [-0.1700, 51.4641], // Clapham Junction
          [-0.2088, 51.4643], // Wandsworth Town
          [-0.2332, 51.4682], // Putney
          [-0.2519, 51.4651], // Barnes
          [-0.2710, 51.4644], // Mortlake
          [-0.2840, 51.4628], // North Sheen
          [-0.3013, 51.4641], // Richmond
        ],
      },
    },

    // ===================== GREAT NORTHERN =====================
    {
      type: "Feature",
      properties: { line: "Great Northern", color: "#6E2585" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.1246, 51.5300], // King's Cross
          [-0.1047, 51.5640], // Highbury & Islington (via Drayton Park)
          [-0.0990, 51.5837], // Finsbury Park
          [-0.1104, 51.6013], // Crouch Hill area
          [-0.1175, 51.6104], // Hornsey
          [-0.1200, 51.6245], // Alexandra Palace
          [-0.1299, 51.6402], // New Southgate area
          [-0.1710, 51.6517], // Oakleigh Park
          [-0.1877, 51.6585], // New Barnet
          [-0.2035, 51.6685], // Hadley Wood area
          [-0.2232, 51.6850], // Potters Bar
        ],
      },
    },
    // Great Northern - Moorgate branch
    {
      type: "Feature",
      properties: { line: "Great Northern", color: "#6E2585" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.0884, 51.5200], // Moorgate
          [-0.0887, 51.5256], // Old Street
          [-0.1058, 51.5506], // Essex Road area
          [-0.1047, 51.5640], // Highbury & Islington
          [-0.0925, 51.5713], // Drayton Park
          [-0.0990, 51.5837], // Finsbury Park
          [-0.0870, 51.6018], // Harringay
          [-0.0790, 51.6147], // Hornsey area
          [-0.0724, 51.6322], // Wood Green / Bowes Park
          [-0.0608, 51.6462], // Palmers Green
          [-0.0506, 51.6568], // Winchmore Hill
          [-0.0499, 51.6700], // Grange Park
          [-0.0529, 51.6812], // Enfield Chase
          [-0.0610, 51.6890], // Gordon Hill
        ],
      },
    },

    // ===================== C2C (Fenchurch Street to Essex) =====================
    {
      type: "Feature",
      properties: { line: "c2c", color: "#B71C4C" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.0795, 51.5119], // Fenchurch Street
          [-0.0477, 51.5087], // Limehouse
          [-0.0005, 51.5124], // West Ham area
          [0.0389, 51.5282], // Barking
          [0.0602, 51.5396], // Upminster area
          [0.0894, 51.5431], // Ockendon area
          [0.1150, 51.5500], // Chafford Hundred
          [0.1832, 51.5416], // Grays
          [0.2298, 51.5363], // Tilbury
          [0.2819, 51.5226], // Stanford-le-Hope area
        ],
      },
    },
  ],
};
