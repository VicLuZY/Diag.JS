import type { DeviceDef } from './sld-types.js';

// cspell:ignore ATSS STSS UPSS SWGR SWBD PNLB MCCB PDUB RPPB BUSW TAPB PARB MVBS MVSW RMUB BRKR ACBR VCBR LBSW FUSD SWCH CONT TRFM AUTO RECT INVT CHRG VFDR SOFT REAC HFLT METR ENRG PQMT CTXF VTXF CABX COND TRAY DUCT WIRE JBOX LGHT RCPT MOTR EVCH AHUX RTUX CHLR PUMP FANX FPMP ELEV ESCL ITLD TENL SPDV CAPB SVGV SVCV

export const DEVICE_CATALOG = {
  // -------- Sources (SRC) --------
  UTIL: { category: 'SRC', name: 'Utility Service Source', ports: { out: { dir: 'out', kind: 'power' } } },
  GENS: { category: 'SRC', name: 'Generator Set Source', ports: { out: { dir: 'out', kind: 'power' } } },
  PVIN: { category: 'SRC', name: 'PV Inverter AC Source', ports: { out: { dir: 'out', kind: 'power' } } },
  BESS: { category: 'SRC', name: 'Battery Inverter AC Source', ports: { out: { dir: 'out', kind: 'power' } } },
  TURB: { category: 'SRC', name: 'Turbine Generator Source', ports: { out: { dir: 'out', kind: 'power' } } },

  // -------- Bus-class manifolds (BUS) --------
  BUSS: { category: 'BUS', name: 'Generic Bus Manifold', ports: { bus: { dir: 'io', kind: 'power' } } },
  SWGR: { category: 'BUS', name: 'Low Voltage Switchgear Bus Section', ports: { bus: { dir: 'io', kind: 'power' } } },
  SWBD: { category: 'BUS', name: 'Switchboard Bus Section', ports: { bus: { dir: 'io', kind: 'power' } } },
  PNLB: { category: 'BUS', name: 'Panelboard Bus Section', ports: { bus: { dir: 'io', kind: 'power' } } },
  MCCB: { category: 'BUS', name: 'Motor Control Center Bus Section', ports: { bus: { dir: 'io', kind: 'power' } } },
  PDUB: { category: 'BUS', name: 'Power Distribution Unit Bus', ports: { bus: { dir: 'io', kind: 'power' } } },
  RPPB: { category: 'BUS', name: 'Remote Power Panel Bus', ports: { bus: { dir: 'io', kind: 'power' } } },
  BUSW: { category: 'BUS', name: 'Busway / Bus Duct Trunk Manifold', ports: { bus: { dir: 'io', kind: 'power' } } },
  TAPB: { category: 'BUS', name: 'Busway Tap Box Manifold', ports: { bus: { dir: 'io', kind: 'power' } } },
  PARB: { category: 'BUS', name: 'Paralleling Bus Manifold', ports: { bus: { dir: 'io', kind: 'power' } } },

  // Medium voltage (optional in buildings)
  MVBS: { category: 'BUS', name: 'Medium Voltage Bus Manifold', ports: { bus: { dir: 'io', kind: 'power' } } },
  MVSW: { category: 'BUS', name: 'Medium Voltage Switchgear Bus Section', ports: { bus: { dir: 'io', kind: 'power' } } },
  RMUB: { category: 'BUS', name: 'Ring Main Unit Bus Manifold', ports: { bus: { dir: 'io', kind: 'power' } } },

  // -------- Inline single-point devices (INL) --------
  BRKR: {
    category: 'INL',
    name: 'Circuit Breaker (Generic)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  ACBR: {
    category: 'INL',
    name: 'Air Circuit Breaker (LV)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  VCBR: {
    category: 'INL',
    name: 'Vacuum Circuit Breaker (MV)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  LBSW: {
    category: 'INL',
    name: 'Load Break Switch (MV)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  DISC: {
    category: 'INL',
    name: 'Disconnect Switch (Non-fused)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  FUSD: {
    category: 'INL',
    name: 'Fused Disconnect / Fused Switch',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  SWCH: {
    category: 'INL',
    name: 'Switch (Non-protective)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  CONT: {
    category: 'INL',
    name: 'Power Contactor',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },

  // Conversion / conditioning
  TRFM: {
    category: 'INL',
    name: 'Transformer (2-winding)',
    ports: {
      in: { dir: 'in', kind: 'power', note: 'primary' },
      out: { dir: 'out', kind: 'power', note: 'secondary' },
    },
  },
  AUTO: {
    category: 'INL',
    name: 'Autotransformer',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  RECT: {
    category: 'INL',
    name: 'Rectifier',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  INVT: {
    category: 'INL',
    name: 'Inverter',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  CHRG: {
    category: 'INL',
    name: 'Battery Charger',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  VFDR: {
    category: 'INL',
    name: 'Variable Frequency Drive',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  SOFT: {
    category: 'INL',
    name: 'Soft Starter',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  REAC: {
    category: 'INL',
    name: 'Reactor (Line/Load)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  HFLT: {
    category: 'INL',
    name: 'Harmonic Filter (Series)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },

  // Metering (series)
  METR: {
    category: 'INL',
    name: 'Meter (Series)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  ENRG: {
    category: 'INL',
    name: 'Energy Meter (Series)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  PQMT: {
    category: 'INL',
    name: 'Power Quality Meter (Series)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },

  // Instrumentation blocks (often shown, not always in power path)
  CTXF: {
    category: 'INL',
    name: 'Current Transformer Set (Inline representation)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  VTXF: {
    category: 'INL',
    name: 'Voltage Transformer Set (Inline representation)',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },

  // Media as devices (inline)
  CABX: {
    category: 'INL',
    name: 'Cable Segment',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  COND: {
    category: 'INL',
    name: 'Conduit Segment',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  TRAY: {
    category: 'INL',
    name: 'Cable Tray Segment',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  DUCT: {
    category: 'INL',
    name: 'Duct Bank Segment',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  WIRE: {
    category: 'INL',
    name: 'Wiring Segment',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },
  JBOX: {
    category: 'INL',
    name: 'Junction / Transition Box',
    ports: { in: { dir: 'in', kind: 'power' }, out: { dir: 'out', kind: 'power' } },
  },

  // -------- Loads (LOD) --------
  LOAD: { category: 'LOD', name: 'Generic Load', ports: { in: { dir: 'in', kind: 'power' } } },
  LGHT: { category: 'LOD', name: 'Lighting Load Group', ports: { in: { dir: 'in', kind: 'power' } } },
  RCPT: { category: 'LOD', name: 'Receptacle Load Group', ports: { in: { dir: 'in', kind: 'power' } } },
  MOTR: { category: 'LOD', name: 'Motor Load', ports: { in: { dir: 'in', kind: 'power' } } },
  EVCH: { category: 'LOD', name: 'EV Charger', ports: { in: { dir: 'in', kind: 'power' } } },
  AHUX: { category: 'LOD', name: 'Air Handling Unit', ports: { in: { dir: 'in', kind: 'power' } } },
  RTUX: { category: 'LOD', name: 'Rooftop Unit', ports: { in: { dir: 'in', kind: 'power' } } },
  CHLR: { category: 'LOD', name: 'Chiller', ports: { in: { dir: 'in', kind: 'power' } } },
  PUMP: { category: 'LOD', name: 'Pump', ports: { in: { dir: 'in', kind: 'power' } } },
  FANX: { category: 'LOD', name: 'Fan', ports: { in: { dir: 'in', kind: 'power' } } },
  FPMP: { category: 'LOD', name: 'Fire Pump', ports: { in: { dir: 'in', kind: 'power' } } },
  ELEV: { category: 'LOD', name: 'Elevator Group', ports: { in: { dir: 'in', kind: 'power' } } },
  ESCL: { category: 'LOD', name: 'Escalator Group', ports: { in: { dir: 'in', kind: 'power' } } },
  ITLD: { category: 'LOD', name: 'IT Load Group', ports: { in: { dir: 'in', kind: 'power' } } },
  TENL: { category: 'LOD', name: 'Tenant Load Group', ports: { in: { dir: 'in', kind: 'power' } } },

  // Shunt devices modeled as loads fed from a bus via protection
  SPDV: { category: 'LOD', name: 'Surge Protective Device (Shunt)', ports: { in: { dir: 'in', kind: 'power' } } },
  CAPB: { category: 'LOD', name: 'Capacitor Bank (Shunt)', ports: { in: { dir: 'in', kind: 'power' } } },
  SVGV: { category: 'LOD', name: 'Static VAR Generator (Shunt)', ports: { in: { dir: 'in', kind: 'power' } } },
  SVCV: { category: 'LOD', name: 'Static VAR Compensator (Shunt)', ports: { in: { dir: 'in', kind: 'power' } } },

  // -------- Assemblies (ASM) --------
  ATSS: {
    category: 'ASM',
    name: 'Automatic Transfer Switch System (Assembly)',
    ports: {
      norm: { dir: 'in', kind: 'power', note: 'normal source in' },
      emer: { dir: 'in', kind: 'power', note: 'backup source in' },
      load: { dir: 'out', kind: 'power', note: 'to load bus / lineup' },
    },
    notes: 'Expands into input breakers + common bus + optional bypass and output breaker.',
  },
  STSS: {
    category: 'ASM',
    name: 'Static Transfer Switch System (Assembly)',
    ports: {
      srcA: { dir: 'in', kind: 'power' },
      srcB: { dir: 'in', kind: 'power' },
      load: { dir: 'out', kind: 'power' },
    },
  },
  UPSS: {
    category: 'ASM',
    name: 'UPS System (Assembly)',
    ports: {
      in: { dir: 'in', kind: 'power' },
      out: { dir: 'out', kind: 'power' },
    },
    notes: 'May expand into rectifier + inverter + bypass path + internal busses.',
  },
} as const satisfies Record<string, DeviceDef>;

export type DeviceCode = keyof typeof DEVICE_CATALOG;

export type DeviceDefFor<C extends DeviceCode> = (typeof DEVICE_CATALOG)[C];

export type PortName<C extends DeviceCode> = keyof DeviceDefFor<C>['ports'];

export type CategoryOf<C extends DeviceCode> = DeviceDefFor<C>['category'];

export const isDeviceCode = (code: string): code is DeviceCode => code in DEVICE_CATALOG;
export const isBusCode = (code: DeviceCode) => DEVICE_CATALOG[code].category === 'BUS';
export const isAssemblyCode = (code: DeviceCode) => DEVICE_CATALOG[code].category === 'ASM';

