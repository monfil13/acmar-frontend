export const ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  CONTROL: 'control',
  PV_PROPIO: 'pv_propio',
  PV_MAYOREO: 'pv_mayoreo',
  DISTRIBUIDOR: 'distribuidor',
}

export const isAdmin = (rol) =>
  [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.CONTROL].includes(rol)

export const isPuntoVenta = (rol) =>
  [ROLES.PV_PROPIO, ROLES.PV_MAYOREO].includes(rol)

export const canCreateRemision = (rol) =>
  isAdmin(rol)

export const canCreateVenta = (rol) =>
  rol !== ROLES.DISTRIBUIDOR

export const canSelectOrigen = (rol) =>
  isAdmin(rol)

export const canSeeMayoreo = (rol) =>
  rol === ROLES.PV_MAYOREO || isAdmin(rol)