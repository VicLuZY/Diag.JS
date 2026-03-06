export const electricalShowcaseSource = `title "Building Electrical Distribution — Single-Line Diagram"
node UTIL "Utility Service" symbol utility
param UTIL voltage 25kV
param UTIL fault 12kA
node XFMR1 "XFMR-1" symbol transformer
param XFMR1 rating 1500kVA
param XFMR1 secondary 480Y/277V
node MSB "MSB-1" symbol switchboard
param MSB type switchboard
param MSB ampacity 3000A
param MSB system 600V
node XFLP "XFMR-LP" symbol transformer
param XFLP rating 300kVA
param XFLP secondary 208Y/120V
node LSB "Lighting and Receptacle Switchboard" symbol switchboard
param LSB system 208Y/120V
param LSB main breaker
param LSB ampacity 1200A
node LP1 "LP-1" symbol panel
param LP1 system 208Y/120V
param LP1 ampacity 225A
node LP2 "LP-2" symbol panel
param LP2 system 208Y/120V
param LP2 ampacity 225A
node RP1 "RP-1" symbol panel
param RP1 system 208Y/120V
param RP1 ampacity 225A
node MCC1 "MCC-1" symbol mcc
param MCC1 system 480V
param MCC1 duty mechanical
node MCC2 "MCC-2" symbol mcc
param MCC2 system 480V
param MCC2 duty basement
node DP1 "DP-1" symbol panel
param DP1 system 480V
param DP1 ampacity 400A
node DP2 "DP-2" symbol panel
param DP2 system 480V
param DP2 ampacity 250A
node LGT_W "General Lighting" symbol lighting
param LGT_W panel LP1
node LGT_C "Corridor Lighting" symbol lighting
param LGT_C panel LP1
node LGT_E "Exterior Lighting" symbol lighting
param LGT_E panel LP2
node TEN_L "Tenant Lighting" symbol lighting
param TEN_L panel LP2
node REC_G "Convenience Receptacles" symbol receptacle
param REC_G panel RP1
node IT_O "IT and Office" symbol receptacle
param IT_O panel RP1
node CH1 "Chiller No. 1" symbol chiller
param CH1 power 200HP
node CHP "CHW Pump" symbol pump
param CHP power 40HP
node AHU1 "AHU-1" symbol hvac
param AHU1 power 25HP
node EF1 "Exhaust Fan" symbol fan
param EF1 power 10HP
node BLR "Boiler Plant" symbol boiler
param BLR power 75HP
node CWP "CW Pump" symbol pump
param CWP power 30HP
node AHU2 "AHU-2" symbol hvac
param AHU2 power 20HP
node RTU1 "RTU-1" symbol rtu
param RTU1 demand 50kVA
node ELV "Elevator" symbol elevator
param ELV demand 75kVA
node KIT "Kitchen HVAC" symbol hvac
param KIT demand 35kVA
edge UTIL XFMR1 "service"
edge XFMR1 MSB "main secondary"
edge MSB XFLP "lighting transformer"
edge MSB MCC1 "mechanical"
edge MSB MCC2 "basement"
edge MSB DP1 "distribution"
edge MSB DP2 "mechanical panel"
edge XFLP LSB "secondary main"
edge LSB LP1 "lighting branch"
edge LSB LP2 "lighting branch"
edge LSB RP1 "receptacle branch"
edge LP1 LGT_W "branch ccts"
edge LP1 LGT_C "branch ccts"
edge LP2 LGT_E "branch ccts"
edge LP2 TEN_L "branch ccts"
edge RP1 REC_G "branch ccts"
edge RP1 IT_O "branch ccts"
edge MCC1 CH1 "starter"
edge MCC1 CHP "starter"
edge MCC1 AHU1 "starter"
edge MCC1 EF1 "starter"
edge MCC2 BLR "starter"
edge MCC2 CWP "starter"
edge MCC2 AHU2 "starter"
edge DP1 RTU1 "feeder"
edge DP1 ELV "feeder"
edge DP2 KIT "feeder"`;

export const electricalPrimaryFeeders = [
  { id: 'LSB', detail: '208Y/120 V switchboard distributing the transformer secondary to downstream panels.' },
  { id: 'XFLP', detail: 'Step-down transformer serving lighting and receptacle distribution.' },
  { id: 'MCC1', detail: 'Primary mechanical motor control center.' },
  { id: 'MCC2', detail: 'Basement mechanical motor control center.' },
  { id: 'DP1', detail: '480 V distribution panel for major equipment loads.' },
  { id: 'DP2', detail: 'Dedicated mechanical panel for kitchen HVAC service.' },
];

export const hvacShowcaseSource = `title "Office Tower HVAC Mechanical Schematic"
node OA1 "Outside Air Intake Louver" symbol outside-air
param OA1 lane air
param OA1 column 0
param OA1 slot 0
node ERV1 "Energy Recovery Wheel" symbol energy-recovery
param ERV1 lane air
param ERV1 column 1
param ERV1 slot 0
node MX1 "AHU-1 Mixing Box" symbol mixing-box
param MX1 lane air
param MX1 column 2
param MX1 slot 0
node FIL1 "MERV 13 Filter Bank" symbol filter
param FIL1 lane air
param FIL1 column 3
param FIL1 slot 0
node CC1 "AHU-1 Cooling Coil" symbol cooling-coil
param CC1 lane air
param CC1 column 4
param CC1 slot 0
node HC1 "AHU-1 Heating Coil" symbol heating-coil
param HC1 lane air
param HC1 column 5
param HC1 slot 0
node HUM1 "Steam Grid Humidifier" symbol humidifier
param HUM1 lane air
param HUM1 column 6
param HUM1 slot 0
node SF1 "Supply Fan Array" symbol fan
param SF1 lane air
param SF1 column 7
param SF1 slot 0
node SD1 "Main Supply Duct" symbol duct
param SD1 lane air
param SD1 column 8
param SD1 slot 0
node VAV1 "VAV-1 East Open Office" symbol vav
param VAV1 lane air
param VAV1 column 9
param VAV1 slot 0
param VAV1 reheat hot-water
node VAV2 "VAV-2 South Perimeter" symbol vav
param VAV2 lane air
param VAV2 column 9
param VAV2 slot 1
node VAV3 "VAV-3 Conference Reheat" symbol vav
param VAV3 lane air
param VAV3 column 9
param VAV3 slot 2
param VAV3 reheat hot-water
node RELF1 "Relief Fan" symbol relief-fan
param RELF1 lane exhaust
param RELF1 column 3
param RELF1 slot 0
node RLV1 "Relief Louver" symbol relief-louver
param RLV1 lane exhaust
param RLV1 column 4
param RLV1 slot 0
node RA1 "Main Return Duct" symbol duct
param RA1 lane exhaust
param RA1 column 10
param RA1 slot 0
node RF1 "Return Fan" symbol return-fan
param RF1 lane exhaust
param RF1 column 9
param RF1 slot 0
node DIF1 "East Diffusers" symbol diffuser
param DIF1 lane terminal
param DIF1 column 10
param DIF1 slot 0
node DIF2 "South Diffusers" symbol diffuser
param DIF2 lane terminal
param DIF2 column 10
param DIF2 slot 1
node DIF3 "Conference Diffusers" symbol diffuser
param DIF3 lane terminal
param DIF3 column 10
param DIF3 slot 2
node FCU1 "Lobby Fan Coil Unit" symbol fcu
param FCU1 lane terminal
param FCU1 column 10
param FCU1 slot 3
param FCU1 airflow 1200cfm
node ZN1 "Open Office East" symbol zone
param ZN1 lane terminal
param ZN1 column 12
param ZN1 slot 0
node ZN2 "South Perimeter Offices" symbol zone
param ZN2 lane terminal
param ZN2 column 12
param ZN2 slot 1
node ZN3 "Conference Room" symbol zone
param ZN3 lane terminal
param ZN3 column 12
param ZN3 slot 2
node ZN4 "Lobby" symbol zone
param ZN4 lane terminal
param ZN4 column 12
param ZN4 slot 3
node RG1 "East Return Grille" symbol grille
param RG1 lane terminal
param RG1 column 13
param RG1 slot 0
node RG2 "South Return Grille" symbol grille
param RG2 lane terminal
param RG2 column 13
param RG2 slot 1
node RG3 "Conference Return Grille" symbol grille
param RG3 lane terminal
param RG3 column 13
param RG3 slot 2
node RG4 "Lobby Return Grille" symbol grille
param RG4 lane terminal
param RG4 column 13
param RG4 slot 3
node CT1 "Cooling Tower Cell 1" symbol cooling-tower
param CT1 lane condenser
param CT1 column 0
param CT1 slot 0
node CT2 "Cooling Tower Cell 2" symbol cooling-tower
param CT2 lane condenser
param CT2 column 0
param CT2 slot 1
node CWP1 "CWP-1" symbol pump
param CWP1 lane condenser
param CWP1 column 1
param CWP1 slot 0
param CWP1 flow 1450gpm
node CWP2 "CWP-2" symbol pump
param CWP2 lane condenser
param CWP2 column 1
param CWP2 slot 1
param CWP2 flow 1450gpm
node CH1 "Chiller CH-1" symbol chiller
param CH1 lane chilled
param CH1 column 2
param CH1 slot 0
param CH1 capacity 420T
param CH1 type water-cooled
node CH2 "Chiller CH-2" symbol chiller
param CH2 lane chilled
param CH2 column 2
param CH2 slot 1
param CH2 capacity 420T
param CH2 type water-cooled
node CHWP1 "Primary CHW Pump Set A" symbol pump
param CHWP1 lane chilled
param CHWP1 column 3
param CHWP1 slot 0
param CHWP1 flow 980gpm
node CHWP2 "Primary CHW Pump Set B" symbol pump
param CHWP2 lane chilled
param CHWP2 column 3
param CHWP2 slot 1
param CHWP2 flow 980gpm
node CHWS "CHW Supply Header" symbol header
param CHWS lane chilled
param CHWS column 4
param CHWS slot 0
node ST1 "CHW Supply Strainer" symbol strainer
param ST1 lane chilled
param ST1 column 5
param ST1 slot 0
node CV1 "AHU Cooling Valve" symbol control-valve
param CV1 lane chilled
param CV1 column 6
param CV1 slot 0
node CV2 "FCU Cooling Valve" symbol control-valve
param CV2 lane chilled
param CV2 column 6
param CV2 slot 1
node CHWR "CHW Return Header" symbol header
param CHWR lane chilled
param CHWR column 8
param CHWR slot 0
node DIRT1 "Dirt Separator" symbol dirt-separator
param DIRT1 lane chilled
param DIRT1 column 9
param DIRT1 slot 0
node BLR1 "Condensing Boiler B-1" symbol boiler
param BLR1 lane heating
param BLR1 column 2
param BLR1 slot 0
param BLR1 input gas
param BLR1 capacity 3200MBH
node BLR2 "Condensing Boiler B-2" symbol boiler
param BLR2 lane heating
param BLR2 column 2
param BLR2 slot 1
param BLR2 input gas
param BLR2 capacity 3200MBH
node HWP1 "HHW Pump Set" symbol pump
param HWP1 lane heating
param HWP1 column 3
param HWP1 slot 0
param HWP1 flow 520gpm
node SEP1 "Air Separator" symbol air-separator
param SEP1 lane heating
param SEP1 column 4
param SEP1 slot 0
node XT1 "Expansion Tank" symbol expansion-tank
param XT1 lane heating
param XT1 column 5
param XT1 slot 0
node HHWS "HHW Supply Header" symbol header
param HHWS lane heating
param HHWS column 6
param HHWS slot 0
node HCV1 "AHU Heating Valve" symbol control-valve
param HCV1 lane heating
param HCV1 column 7
param HCV1 slot 0
node HCV2 "VAV Reheat Valve" symbol balancing-valve
param HCV2 lane heating
param HCV2 column 7
param HCV2 slot 1
node HCV3 "FCU Heating Valve" symbol control-valve
param HCV3 lane heating
param HCV3 column 7
param HCV3 slot 2
node HWR "HHW Return Header" symbol header
param HWR lane heating
param HWR column 9
param HWR slot 0
node BAS1 "BMS Panel" symbol bms
param BAS1 lane controls
param BAS1 column 6
param BAS1 slot 0
node SAT1 "Supply Air Temperature Sensor" symbol sensor
param SAT1 lane controls
param SAT1 column 7
param SAT1 slot 0
node DSP1 "Duct Static Pressure Sensor" symbol sensor
param DSP1 lane controls
param DSP1 column 8
param DSP1 slot 0
node TSTAT1 "East Zone Thermostat" symbol thermostat
param TSTAT1 lane controls
param TSTAT1 column 11
param TSTAT1 slot 0
node TSTAT2 "South Zone Thermostat" symbol thermostat
param TSTAT2 lane controls
param TSTAT2 column 11
param TSTAT2 slot 1
node TSTAT3 "Conference Thermostat" symbol thermostat
param TSTAT3 lane controls
param TSTAT3 column 11
param TSTAT3 slot 2
node TSTAT4 "Lobby Thermostat" symbol thermostat
param TSTAT4 lane controls
param TSTAT4 column 11
param TSTAT4 slot 3
edge OA1 ERV1 "OA"
edge ERV1 MX1 "OA"
edge RF1 MX1 "RA"
edge MX1 FIL1 "mixed air"
edge MX1 RELF1 "relief air"
edge RELF1 RLV1 "relief air"
edge FIL1 CC1 "SA"
edge CC1 HC1 "SA"
edge HC1 HUM1 "SA"
edge HUM1 SF1 "SA"
edge SF1 SD1 "SA"
edge SD1 VAV1 "SA"
edge SD1 VAV2 "SA"
edge SD1 VAV3 "SA"
edge VAV1 DIF1 "SA"
edge VAV2 DIF2 "SA"
edge VAV3 DIF3 "SA"
edge DIF1 ZN1 "SA"
edge DIF2 ZN2 "SA"
edge DIF3 ZN3 "SA"
edge FCU1 ZN4 "SA"
edge ZN1 RG1 "RA"
edge ZN2 RG2 "RA"
edge ZN3 RG3 "RA"
edge ZN4 RG4 "RA"
edge RG1 RA1 "RA"
edge RG2 RA1 "RA"
edge RG3 RA1 "RA"
edge RG4 RA1 "RA"
edge RA1 RF1 "RA"
edge CT1 CWP1 "CWS"
edge CT2 CWP2 "CWS"
edge CWP1 CH1 "CWS"
edge CWP2 CH2 "CWS"
edge CH1 CT1 "CWR"
edge CH2 CT2 "CWR"
edge CH1 CHWP1 "CHWS"
edge CH2 CHWP2 "CHWS"
edge CHWP1 CHWS "CHWS"
edge CHWP2 CHWS "CHWS"
edge CHWS ST1 "CHWS"
edge ST1 CV1 "CHWS"
edge ST1 CV2 "CHWS"
edge CV1 CC1 "CHWS"
edge CV2 FCU1 "CHWS"
edge CC1 CHWR "CHWR"
edge FCU1 CHWR "CHWR"
edge CHWR DIRT1 "CHWR"
edge DIRT1 CH1 "CHWR"
edge DIRT1 CH2 "CHWR"
edge BLR1 HWP1 "HHWS"
edge BLR2 HWP1 "HHWS"
edge HWP1 SEP1 "HHWS"
edge SEP1 XT1 "tap"
edge SEP1 HHWS "HHWS"
edge HHWS HCV1 "HHWS"
edge HHWS HCV2 "HHWS"
edge HHWS HCV3 "HHWS"
edge HCV1 HC1 "HHWS"
edge HCV2 VAV3 "HHWS"
edge HCV3 FCU1 "HHWS"
edge HC1 HWR "HHWR"
edge VAV3 HWR "HHWR"
edge FCU1 HWR "HHWR"
edge HWR BLR1 "HHWR"
edge HWR BLR2 "HHWR"
edge BAS1 SAT1 "control"
edge BAS1 DSP1 "control"
edge BAS1 TSTAT1 "control"
edge BAS1 TSTAT2 "control"
edge BAS1 TSTAT3 "control"
edge BAS1 TSTAT4 "control"
edge SAT1 SF1 "control"
edge DSP1 SD1 "control"
edge TSTAT1 VAV1 "control"
edge TSTAT2 VAV2 "control"
edge TSTAT3 VAV3 "control"
edge TSTAT4 FCU1 "control"`;

export const hvacSystems = [
  { id: 'CT1', detail: 'Condenser water loop with cooling towers, paired pumps, and water-cooled chillers.' },
  { id: 'CHWS', detail: 'Primary chilled-water supply and return serving the AHU cooling coil and lobby FCU.' },
  { id: 'HHWS', detail: 'Heating hot-water loop serving the AHU heating coil, VAV reheat, and FCU heat.' },
  { id: 'MX1', detail: 'Airside train with outdoor air, energy recovery, mixed-air box, filtration, coils, humidification, and fan array.' },
  { id: 'VAV1', detail: 'Zone distribution through VAV terminals, fan-coil support, diffusers, zones, and return grilles.' },
  { id: 'BAS1', detail: 'Controls layer coordinating supply air, duct static, zone thermostats, and terminal control.' },
];
