export interface MenuDish {
  id: string
  dishName: string
  description: string | null
  displayOrder: number
}

export interface Menu {
  id: string
  restaurantId: string
  name: string
  description: string | null
  displayOrder: number
  dishes: MenuDish[]
  createdAt: string
}

export interface MenuDishRequest {
  dishName: string
  description?: string
  displayOrder: number
}

export interface MenuRequest {
  name: string
  description?: string
  dishes: MenuDishRequest[]
}
