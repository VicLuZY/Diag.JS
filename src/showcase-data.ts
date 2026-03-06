export interface ShowcaseDetail {
  id: string;
  detail: string;
}

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
param MSB system 480Y/277V
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

export const electricalPrimaryFeeders: ShowcaseDetail[] = [
  { id: 'LSB', detail: '208Y/120 V switchboard distributing the transformer secondary to downstream lighting and receptacle panels.' },
  { id: 'XFLP', detail: 'Step-down transformer serving lighting and receptacle distribution.' },
  { id: 'MCC1', detail: 'Primary mechanical motor control center feeding central plant and airside equipment.' },
  { id: 'MCC2', detail: 'Basement mechanical motor control center feeding boiler and pumping loads.' },
  { id: 'DP1', detail: '480 V distribution panel for major equipment feeders.' },
  { id: 'DP2', detail: 'Dedicated 480 V panelboard feeding kitchen HVAC.' },
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

export const hvacSystems: ShowcaseDetail[] = [
  { id: 'CT1', detail: 'Condenser water loop with cooling towers, paired pumps, and water-cooled chillers.' },
  { id: 'CHWS', detail: 'Primary chilled-water supply and return serving the AHU cooling coil and lobby FCU.' },
  { id: 'HHWS', detail: 'Heating hot-water loop serving the AHU heating coil, VAV reheat, and FCU heat.' },
  { id: 'MX1', detail: 'Airside train with outdoor air, energy recovery, mixed-air box, filtration, coils, humidification, and fan array.' },
  { id: 'VAV1', detail: 'Zone distribution through VAV terminals, fan-coil support, diffusers, zones, and return grilles.' },
  { id: 'BAS1', detail: 'Controls layer coordinating supply air, duct static, zone thermostats, and terminal control.' },
];

export const networkShowcaseSource = `title "Data Centre and Campus Network Architecture"
node WAN1 "Carrier Internet A" symbol cloud
param WAN1 lane external
param WAN1 column 0
param WAN1 slot 0
node WAN2 "Carrier Internet B" symbol cloud
param WAN2 lane external
param WAN2 column 0
param WAN2 slot 1
node CAMPUS1 "Campus Backbone Ring A" symbol core
param CAMPUS1 lane campus
param CAMPUS1 column 1
param CAMPUS1 slot 0
node CAMPUS2 "Campus Backbone Ring B" symbol core
param CAMPUS2 lane campus
param CAMPUS2 column 1
param CAMPUS2 slot 1
node RTRA "Border Router A" symbol router
param RTRA lane core
param RTRA column 2
param RTRA slot 0
node RTRB "Border Router B" symbol router
param RTRB lane core
param RTRB column 2
param RTRB slot 1
node FWA "Perimeter Firewall Cluster" symbol firewall
param FWA lane services
param FWA column 3
param FWA slot 0
node ADC1 "Global Server Load Balancer" symbol adc
param ADC1 lane services
param ADC1 column 4
param ADC1 slot 0
node COREA "Core Switch Pair A" symbol core
param COREA lane core
param COREA column 4
param COREA slot 0
node COREB "Core Switch Pair B" symbol core
param COREB lane core
param COREB column 4
param COREB slot 1
node DNS1 "DNS / DHCP / NTP Services" symbol service_cluster
param DNS1 lane services
param DNS1 column 5
param DNS1 slot 0
node IDM1 "Identity / PKI Services" symbol service_cluster
param IDM1 lane services
param IDM1 column 5
param IDM1 slot 1
node OOB1 "Out-of-Band Management Switch" symbol management_switch
param OOB1 lane services
param OOB1 column 5
param OOB1 slot 2
node SEC1 "SIEM / Video / Access Security" symbol security
param SEC1 lane services
param SEC1 column 5
param SEC1 slot 3
node SP1 "Spine Fabric A" symbol spine
param SP1 lane fabric
param SP1 column 6
param SP1 slot 0
node SP2 "Spine Fabric B" symbol spine
param SP2 lane fabric
param SP2 column 6
param SP2 slot 1
node LF1 "Leaf Pod 01" symbol leaf
param LF1 lane fabric
param LF1 column 7
param LF1 slot 0
node LF2 "Leaf Pod 02" symbol leaf
param LF2 lane fabric
param LF2 column 7
param LF2 slot 1
node LF3 "Leaf GPU Pod" symbol leaf
param LF3 lane fabric
param LF3 column 7
param LF3 slot 2
node LF4 "Leaf Services Pod" symbol leaf
param LF4 lane fabric
param LF4 column 7
param LF4 slot 3
node VM1 "Virtualization Cluster A" symbol virtualization
param VM1 lane fabric
param VM1 column 8
param VM1 slot 0
node VM2 "Virtualization Cluster B" symbol virtualization
param VM2 lane fabric
param VM2 column 8
param VM2 slot 1
node GPU1 "GPU Training Cluster" symbol gpu
param GPU1 lane fabric
param GPU1 column 8
param GPU1 slot 2
node SANA "SAN Switch A" symbol san
param SANA lane storage
param SANA column 7
param SANA slot 0
node SANB "SAN Switch B" symbol san
param SANB lane storage
param SANB column 7
param SANB slot 1
node STOR1 "All-Flash Storage Array A" symbol storage
param STOR1 lane storage
param STOR1 column 8
param STOR1 slot 0
node STOR2 "All-Flash Storage Array B" symbol storage
param STOR2 lane storage
param STOR2 column 8
param STOR2 slot 1
node BKP1 "Backup / Archive Appliance" symbol backup
param BKP1 lane storage
param BKP1 column 9
param BKP1 slot 0
node BLDG1 "Mixed-Use Tower Gateway" symbol building_gateway
param BLDG1 lane building
param BLDG1 column 8
param BLDG1 slot 0
node BLDG2 "Hotel / Residence Gateway" symbol building_gateway
param BLDG2 lane building
param BLDG2 column 8
param BLDG2 slot 1
node BLDG3 "Research Pavilion Gateway" symbol building_gateway
param BLDG3 lane building
param BLDG3 column 8
param BLDG3 slot 2
node WLC1 "Campus Wireless Controller" symbol wlc
param WLC1 lane building
param WLC1 column 8
param WLC1 slot 3
node IDF1 "Tower IDF Core" symbol idf
param IDF1 lane building
param IDF1 column 9
param IDF1 slot 0
node IDF2 "Hospitality IDF Core" symbol idf
param IDF2 lane building
param IDF2 column 9
param IDF2 slot 1
node IDF3 "Lab IDF Core" symbol idf
param IDF3 lane building
param IDF3 column 9
param IDF3 slot 2
node ACC1 "Office Access Stack" symbol access_switch
param ACC1 lane edge
param ACC1 column 10
param ACC1 slot 0
node ACC2 "Hospitality Access Stack" symbol access_switch
param ACC2 lane edge
param ACC2 column 10
param ACC2 slot 1
node ACC3 "Lab Access Stack" symbol access_switch
param ACC3 lane edge
param ACC3 column 10
param ACC3 slot 2
node ACC4 "OT / Security Edge Stack" symbol access_switch
param ACC4 lane edge
param ACC4 column 10
param ACC4 slot 3
edge WAN1 CAMPUS1 "400G campus backbone"
edge WAN2 CAMPUS2 "400G campus backbone"
edge CAMPUS1 RTRA "400G campus backbone"
edge CAMPUS2 RTRB "400G campus backbone"
edge RTRA FWA "internet"
edge RTRB FWA "internet"
edge FWA COREA "100G core"
edge FWA COREB "100G core"
edge COREA ADC1 "100G core"
edge COREB ADC1 "100G core"
edge COREA DNS1 "100G core"
edge COREB DNS1 "100G core"
edge COREA IDM1 "100G core"
edge COREB IDM1 "100G core"
edge COREA OOB1 "mgmt"
edge COREB OOB1 "mgmt"
edge COREA SEC1 "security"
edge COREB SEC1 "security"
edge COREA SP1 "100G fabric"
edge COREA SP2 "100G fabric"
edge COREB SP1 "100G fabric"
edge COREB SP2 "100G fabric"
edge SP1 LF1 "100G fabric"
edge SP1 LF2 "100G fabric"
edge SP1 LF3 "100G fabric"
edge SP1 LF4 "100G fabric"
edge SP2 LF1 "100G fabric"
edge SP2 LF2 "100G fabric"
edge SP2 LF3 "100G fabric"
edge SP2 LF4 "100G fabric"
edge LF1 VM1 "100G fabric"
edge LF2 VM2 "100G fabric"
edge LF3 GPU1 "100G fabric"
edge LF4 ADC1 "100G fabric"
edge LF1 SANA "25G storage"
edge LF2 SANB "25G storage"
edge SANA STOR1 "32G FC"
edge SANA STOR2 "32G FC"
edge SANB STOR1 "32G FC"
edge SANB STOR2 "32G FC"
edge STOR1 BKP1 "25G storage"
edge STOR2 BKP1 "25G storage"
edge CAMPUS1 BLDG1 "10/25G access"
edge CAMPUS1 BLDG2 "10/25G access"
edge CAMPUS2 BLDG3 "10/25G access"
edge CAMPUS2 WLC1 "10/25G access"
edge BLDG1 IDF1 "10/25G access"
edge BLDG2 IDF2 "10/25G access"
edge BLDG3 IDF3 "10/25G access"
edge IDF1 ACC1 "10/25G access"
edge IDF2 ACC2 "10/25G access"
edge IDF3 ACC3 "10/25G access"
edge BLDG1 ACC4 "security"
edge WLC1 ACC1 "wifi"
edge WLC1 ACC2 "wifi"
edge WLC1 ACC3 "wifi"
edge OOB1 RTRA "mgmt"
edge OOB1 COREA "mgmt"
edge OOB1 SP1 "mgmt"
edge OOB1 SANA "mgmt"
edge OOB1 BLDG1 "mgmt"
edge SEC1 ACC4 "security"`;

export const networkSystems: ShowcaseDetail[] = [
  { id: 'CAMPUS1', detail: 'Dual-campus backbone ring carrying carrier handoff, remote buildings, and wireless aggregation.' },
  { id: 'FWA', detail: 'Perimeter security tier anchoring the border routers, core switching, and shared services.' },
  { id: 'SP1', detail: 'Leaf-spine fabric serving virtualization, GPU, and platform service pods.' },
  { id: 'SANA', detail: 'Dedicated storage fabric with SAN switching, all-flash arrays, and backup retention.' },
  { id: 'BLDG1', detail: 'Mixed-use building distribution tier with gateways, IDFs, access stacks, and Wi-Fi overlays.' },
  { id: 'OOB1', detail: 'Out-of-band management network supervising border, core, fabric, storage, and building infrastructure.' },
];

export const fireAlarmShowcaseSource = `title "Campus Fire Alarm and Emergency Voice Architecture"
node FCC1 "Campus Fire Command Center Head-End" symbol head_end
param FCC1 lane command
param FCC1 column 0
param FCC1 slot 0
node GFX1 "Graphics Workstation Cluster" symbol head_end
param GFX1 lane command
param GFX1 column 0
param GFX1 slot 1
node NODE1 "Distributed Node - Tower / Hotel" symbol network_node
param NODE1 lane network
param NODE1 column 1
param NODE1 slot 0
node NODE2 "Distributed Node - Commons / Retail" symbol network_node
param NODE2 lane network
param NODE2 column 1
param NODE2 slot 1
node NODE3 "Distributed Node - Lab / Garage / Energy Centre" symbol network_node
param NODE3 lane network
param NODE3 column 1
param NODE3 slot 2
node FACP1 "Tower FACP Main" symbol facp
param FACP1 lane panels
param FACP1 column 2
param FACP1 slot 0
node FACP2 "Hotel FACP Main" symbol facp
param FACP2 lane panels
param FACP2 column 2
param FACP2 slot 1
node FACP3 "Student Commons FACP" symbol facp
param FACP3 lane panels
param FACP3 column 2
param FACP3 slot 2
node FACP4 "Research / Garage FACP" symbol facp
param FACP4 lane panels
param FACP4 column 2
param FACP4 slot 3
node PSU1 "Tower NAC Power Supply" symbol power_supply
param PSU1 lane panels
param PSU1 column 3
param PSU1 slot 0
node PSU2 "Commons NAC Power Supply" symbol power_supply
param PSU2 lane panels
param PSU2 column 3
param PSU2 slot 1
node ANN1 "Tower Lobby Annunciator" symbol annunciator
param ANN1 lane annunciation
param ANN1 column 3
param ANN1 slot 0
node REP1 "Hotel Security Repeater" symbol repeater
param REP1 lane annunciation
param REP1 column 3
param REP1 slot 1
node ANN2 "Retail Entry Annunciator" symbol annunciator
param ANN2 lane annunciation
param ANN2 column 3
param ANN2 slot 2
node TEL1 "Firefighter Telephone Master" symbol firefighter_telephone
param TEL1 lane annunciation
param TEL1 column 3
param TEL1 slot 3
node DUCT1 "AHU-1 Duct Detector" symbol duct_detector
param DUCT1 lane slc
param DUCT1 column 4
param DUCT1 slot 0
node MON1 "Tower East Flow Monitor Module" symbol monitor_module
param MON1 lane slc
param MON1 column 4
param MON1 slot 1
node MON2 "Tower East Tamper Monitor Module" symbol monitor_module
param MON2 lane slc
param MON2 column 4
param MON2 slot 2
node NAC1 "Tower NAC Extender" symbol nac_extender
param NAC1 lane notification
param NAC1 column 4
param NAC1 slot 0
node NAC2 "Commons NAC Extender" symbol nac_extender
param NAC2 lane notification
param NAC2 column 4
param NAC2 slot 1
node CTL1 "Smoke Damper Control Module" symbol control_module
param CTL1 lane specialty
param CTL1 column 5
param CTL1 slot 0
node REL1 "Clean Agent Releasing Panel" symbol releasing
param REL1 lane specialty
param REL1 column 5
param REL1 slot 1
node ASD1 "Data Hall Aspirating Detector" symbol vesda
param ASD1 lane specialty
param ASD1 column 6
param ASD1 slot 0
node SMCTRL1 "Smoke Control Fan Interface" symbol smoke_control
param SMCTRL1 lane specialty
param SMCTRL1 column 6
param SMCTRL1 slot 1
node ELEV1 "Elevator Recall Interface" symbol elevator_interface
param ELEV1 lane specialty
param ELEV1 column 6
param ELEV1 slot 2
node SMK1 "Residential Corridor Smoke Detector" symbol smoke
param SMK1 lane field
param SMK1 column 6
param SMK1 slot 0
node SMK2 "Retail Unit Smoke Detector" symbol smoke
param SMK2 lane field
param SMK2 column 6
param SMK2 slot 1
node HEAT1 "Commercial Kitchen Heat Detector" symbol heat
param HEAT1 lane field
param HEAT1 column 6
param HEAT1 slot 2
node PULL1 "Tower Exit Pull Station" symbol pull
param PULL1 lane field
param PULL1 column 6
param PULL1 slot 3
node PULL2 "Commons Exit Pull Station" symbol pull
param PULL2 lane field
param PULL2 column 6
param PULL2 slot 4
node FLOW1 "Tower East Flow Switch" symbol flow
param FLOW1 lane field
param FLOW1 column 7
param FLOW1 slot 0
node TAMP1 "Tower East Tamper Switch" symbol tamper
param TAMP1 lane field
param TAMP1 column 7
param TAMP1 slot 1
node BEAM1 "Atrium Beam Detector" symbol beam
param BEAM1 lane field
param BEAM1 column 7
param BEAM1 slot 2
node HSTR1 "Tower Guestroom Horn / Strobes" symbol horn
param HSTR1 lane notification
param HSTR1 column 6
param HSTR1 slot 0
node HSTR2 "Parking Garage Horn / Strobes" symbol horn
param HSTR2 lane notification
param HSTR2 column 6
param HSTR2 slot 1
node SPKR1 "Assembly Speaker / Strobes" symbol speaker
param SPKR1 lane notification
param SPKR1 column 6
param SPKR1 slot 2
edge FCC1 GFX1 "network"
edge FCC1 NODE1 "peer ring"
edge NODE1 NODE2 "peer ring"
edge NODE2 NODE3 "peer ring"
edge NODE3 FCC1 "peer ring"
edge NODE1 FACP1 "network"
edge NODE1 FACP2 "network"
edge NODE2 FACP3 "network"
edge NODE3 FACP4 "network"
edge FACP1 ANN1 "network"
edge FACP2 REP1 "network"
edge FACP3 ANN2 "network"
edge FACP1 TEL1 "network"
edge FACP1 PSU1 "network"
edge FACP3 PSU2 "network"
edge FACP1 DUCT1 "SLC"
edge FACP1 MON1 "SLC"
edge FACP1 MON2 "SLC"
edge FACP2 SMK1 "SLC"
edge FACP2 HEAT1 "SLC"
edge FACP2 PULL1 "SLC"
edge FACP3 SMK2 "SLC"
edge FACP3 PULL2 "SLC"
edge FACP3 BEAM1 "SLC"
edge MON1 FLOW1 "monitor"
edge MON2 TAMP1 "monitor"
edge FACP1 NAC1 "NAC"
edge FACP3 NAC2 "NAC"
edge NAC1 HSTR1 "NAC"
edge NAC2 HSTR2 "NAC"
edge NAC2 SPKR1 "audio"
edge FACP4 REL1 "release"
edge REL1 ASD1 "release"
edge FACP1 CTL1 "release"
edge CTL1 SMCTRL1 "smoke control"
edge FACP4 ELEV1 "elevator recall"`;

export const fireAlarmSystems: ShowcaseDetail[] = [
  { id: 'FCC1', detail: 'Campus head-end with graphics, peer node supervision, and command visibility across the site.' },
  { id: 'NODE1', detail: 'Distributed network nodes segment the campus into tower, commons, and lab / garage fire network domains.' },
  { id: 'FACP1', detail: 'Building control panels coordinate annunciation, SLC loops, notification power, and specialty interfaces.' },
  { id: 'NAC1', detail: 'Notification appliance circuits branch through booster power and drive horn / strobe and speaker / strobe coverage.' },
  { id: 'REL1', detail: 'Specialty interfaces cover clean-agent releasing, smoke control, and elevator recall integrations.' },
  { id: 'MON1', detail: 'Addressable monitor and device loops carry supervisory, sprinkler, duct, smoke, heat, pull, and beam inputs.' },
];

export const lightingControlShowcaseSource = `title "Campus Lighting Control Architecture"
node HEAD1 "Enterprise Lighting Head-End" symbol server
param HEAD1 lane headend
param HEAD1 column 0
param HEAD1 slot 0
node GATE1 "BACnet Lighting Gateway" symbol gateway
param GATE1 lane backbone
param GATE1 column 1
param GATE1 slot 0
node SW1 "Backbone Switch A" symbol ethernet_switch
param SW1 lane backbone
param SW1 column 2
param SW1 slot 0
node SW2 "Backbone Switch B" symbol ethernet_switch
param SW2 lane backbone
param SW2 column 2
param SW2 slot 1
node RP1 "Office Relay Panel" symbol relay_panel
param RP1 lane panel
param RP1 column 3
param RP1 slot 0
node DP1 "Office Dimming Panel" symbol dimming_panel
param DP1 lane panel
param DP1 column 3
param DP1 slot 1
node RP2 "Hotel Guestroom Relay Panel" symbol relay_panel
param RP2 lane panel
param RP2 column 3
param RP2 slot 2
node DP2 "Ballroom Dimming Panel" symbol dimming_panel
param DP2 lane panel
param DP2 column 3
param DP2 slot 3
node RP3 "Retail / Food Hall Relay Panel" symbol relay_panel
param RP3 lane panel
param RP3 column 3
param RP3 slot 4
node AREA1 "Office Tower Area Controller" symbol area_controller
param AREA1 lane room
param AREA1 column 4
param AREA1 slot 0
node AREA2 "Hotel / Ballroom Area Controller" symbol area_controller
param AREA2 lane room
param AREA2 column 4
param AREA2 slot 1
node AREA3 "Retail / Food Hall Area Controller" symbol area_controller
param AREA3 lane room
param AREA3 column 4
param AREA3 slot 2
node RC1 "Open Office Room Controller" symbol room_controller
param RC1 lane room
param RC1 column 5
param RC1 slot 0
node RC2 "Ballroom Room Controller" symbol room_controller
param RC2 lane room
param RC2 column 5
param RC2 slot 1
node RC3 "Restaurant Room Controller" symbol room_controller
param RC3 lane room
param RC3 column 5
param RC3 slot 2
node SH1 "Amenity Shade Controller" symbol shade_controller
param SH1 lane room
param SH1 column 5
param SH1 slot 3
node WS1 "Office Wallstation" symbol wallstation
param WS1 lane sensor
param WS1 column 6
param WS1 slot 0
node SCN1 "Ballroom Scene Station" symbol scene_station
param SCN1 lane sensor
param SCN1 column 6
param SCN1 slot 1
node OCC1 "Open Office Occupancy Sensor" symbol occupancy
param OCC1 lane sensor
param OCC1 column 6
param OCC1 slot 2
node DAY1 "Perimeter Daylight Sensor" symbol daylight
param DAY1 lane sensor
param DAY1 column 6
param DAY1 slot 3
node OCC2 "Guestroom Occupancy Sensor" symbol occupancy
param OCC2 lane sensor
param OCC2 column 6
param OCC2 slot 4
node PHOTO1 "Central Plaza Photocell" symbol photocell
param PHOTO1 lane exterior
param PHOTO1 column 6
param PHOTO1 slot 0
node FIX1 "Open Office Luminaires" symbol fixture
param FIX1 lane fixture
param FIX1 column 7
param FIX1 slot 0
node FIX2 "Perimeter Linear Fixtures" symbol fixture
param FIX2 lane fixture
param FIX2 column 7
param FIX2 slot 1
node FIX3 "Ballroom Tunable Fixtures" symbol fixture
param FIX3 lane fixture
param FIX3 column 7
param FIX3 slot 2
node FIX4 "Guestroom Fixture Groups" symbol fixture
param FIX4 lane fixture
param FIX4 column 7
param FIX4 slot 3
node FIX5 "Retail Accent Track" symbol fixture
param FIX5 lane fixture
param FIX5 column 7
param FIX5 slot 4
node SITE1 "Central Plaza Pole Lights" symbol fixture
param SITE1 lane exterior
param SITE1 column 7
param SITE1 slot 0
node SITE2 "Garage Lighting Zones" symbol fixture
param SITE2 lane exterior
param SITE2 column 7
param SITE2 slot 1
node EM1 "Emergency Inverter Sense" symbol emergency_interface
param EM1 lane emergency
param EM1 column 7
param EM1 slot 0
node EM2 "Generator Transfer Sense" symbol emergency_interface
param EM2 lane emergency
param EM2 column 7
param EM2 slot 1
edge HEAD1 GATE1 "Ethernet"
edge GATE1 SW1 "Ethernet"
edge GATE1 SW2 "Ethernet"
edge SW1 RP1 "Ethernet"
edge SW1 DP1 "Ethernet"
edge SW1 AREA1 "Ethernet"
edge SW1 AREA2 "Ethernet"
edge SW2 RP2 "Ethernet"
edge SW2 DP2 "Ethernet"
edge SW2 RP3 "Ethernet"
edge SW2 AREA3 "Ethernet"
edge RP1 RC1 "DALI"
edge DP1 RC1 "0-10V"
edge RP2 RC2 "DALI"
edge DP2 RC2 "DALI"
edge RP3 RC3 "DALI"
edge AREA1 RC1 "sensor bus"
edge AREA2 RC2 "sensor bus"
edge AREA3 RC3 "sensor bus"
edge AREA2 SH1 "shade"
edge RC1 WS1 "sensor"
edge RC1 OCC1 "sensor"
edge RC1 DAY1 "sensor"
edge RC2 SCN1 "sensor"
edge RC2 OCC2 "sensor"
edge RC3 SH1 "sensor"
edge RC1 FIX1 "0-10V"
edge RC1 FIX2 "0-10V"
edge RC2 FIX3 "DALI"
edge RC2 FIX4 "relay"
edge RC3 FIX5 "0-10V"
edge PHOTO1 SITE1 "site"
edge PHOTO1 SITE2 "site"
edge RP3 SITE1 "relay"
edge RP2 SITE2 "relay"
edge EM1 RP1 "emergency"
edge EM1 DP1 "emergency"
edge EM2 RP2 "emergency"
edge EM2 RP3 "emergency"`;

export const lightingControlSystems: ShowcaseDetail[] = [
  { id: 'HEAD1', detail: 'Enterprise head-end coordinates lighting gateways, BACnet integration, and centralized schedule / alarm visibility.' },
  { id: 'RP1', detail: 'Relay and dimming cabinets support office, hospitality, ballroom, retail, and exterior lighting loads.' },
  { id: 'AREA1', detail: 'Area and room controllers distribute local control to wallstations, scene stations, occupancy sensors, daylight sensors, and shade controls.' },
  { id: 'FIX3', detail: 'Fixture groups span tunable ballroom loads, guestrooms, retail accents, office luminaires, and site lighting zones.' },
  { id: 'PHOTO1', detail: 'Exterior photocell and relay logic supervise central plaza and garage lighting operation.' },
  { id: 'EM1', detail: 'Emergency sense inputs coordinate inverter and transfer status with normal lighting control panels.' },
];
