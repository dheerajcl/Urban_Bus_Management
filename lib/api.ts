import { Route } from '../app/dashboard/routes/page'

export async function fetchRoutes(): Promise<Route[]> {
  const response = await fetch('/api/routes')
  if (!response.ok) {
    throw new Error('Failed to fetch routes')
  }
  return response.json()
}

export async function addRoute(route: Omit<Route, 'id'>): Promise<Route> {
  const response = await fetch('/api/routes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(route),
  })
  if (!response.ok) {
    throw new Error('Failed to add route')
  }
  return response.json()
}

export async function updateRoute(id: number, route: Omit<Route, 'id'>): Promise<Route> {
  const response = await fetch(`/api/routes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(route),
  })
  if (!response.ok) {
    throw new Error('Failed to update route')
  }
  return response.json()
}

export async function deleteRoute(id: number): Promise<void> {
  const response = await fetch(`/api/routes/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete route')
  }
}