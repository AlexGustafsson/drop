import React from 'react'
import { Navigate, Route } from 'react-router-dom'
import type { RouteProps } from 'react-router-dom'

import { useApi } from '../lib/api'
import UnauthorizedView from '../pages/UnauthorizedPage'
import { AdminToken, UploadToken } from './token'

export function parseFragments() {
  const fragments = location.hash
    .substring(1)
    .split('&')
    .reduce((result: { [key: string]: string }, fragment) => {
      const [key, value] = fragment.split('=')
      result[key] = value
      return result
    }, {})

  return {
    token: fragments['token'] || null,
    secret: fragments['secret'] || null,
  }
}

export class AuthContext {
  public adminToken: AdminToken | null
  public uploadToken: UploadToken | null
  public uploadSecret: string | null

  constructor() {
    this.adminToken = null
    this.uploadToken = null
    this.uploadSecret = null
  }

  private updateApi() {
    const api = useApi()
    api.setSecurityData({
      adminToken: this.adminToken?.toString() || null,
      uploadToken: this.uploadToken?.toString() || null,
    })
  }

  public login(token: AdminToken, persist: boolean) {
    this.adminToken = token
    this.updateApi()
    if (persist) {
      localStorage.setItem('token', token.toString())
    }
  }

  public logout() {
    localStorage.removeItem('token')
    window.location.replace('/')
  }

  public initialize() {
    const storedAdminToken = localStorage.getItem('token')
    if (storedAdminToken !== null) {
      try {
        const adminToken = AdminToken.parse(storedAdminToken)
        if (adminToken.isValid()) {
          this.adminToken = adminToken
          this.updateApi()
        } else {
          localStorage.removeItem('token')
        }
      } catch (error) {
        localStorage.removeItem('token')
      }
    }

    const fragments = parseFragments()
    if (fragments.token) {
      try {
        const uploadToken = UploadToken.parse(fragments.token)
        if (uploadToken.isValid()) {
          this.uploadToken = uploadToken
        }
      } catch (error) {
        // NOOP
      }
    }

    if (fragments.secret) {
      this.uploadSecret = fragments.secret
    }
  }
}

const auth = new AuthContext()

export function useAuth(): AuthContext {
  return auth
}

type PrivateRouteProps = {
  requireAdmin?: boolean
  requireUpload?: boolean
  redirect?: boolean
  children?: JSX.Element
  element?: JSX.Element | null
}

export function PrivateRoute(props: PrivateRouteProps): JSX.Element | null {
  props = {
    requireAdmin: false,
    requireUpload: false,
    redirect: false,
    ...props,
  }

  const auth = useAuth()
  const { children, requireAdmin, requireUpload, redirect, element } = props

  const authenticated =
    (requireAdmin && auth.adminToken?.isValid()) ||
    (requireUpload && auth.uploadToken?.isValid())
  if (authenticated) {
    return element ? element : children || null
  }

  if (redirect) {
    return <Navigate replace to={{ pathname: '/login' }} />
  }

  return <UnauthorizedView />
}
