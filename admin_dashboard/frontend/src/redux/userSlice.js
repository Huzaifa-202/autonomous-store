import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentUser: null,
  loading: false,
  isSignedIn: null,
  error: false,
}

export const userSlice = createSlice({
  name: 'Currentuser',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
    },
    loginSuccess: (state, action) => {
      state.loading = false

      state.currentUser = action.payload
    },
    loginFailure: (state) => {
      state.loading = false
      state.error = true
    },
    logout: (state) => {
      return initialState
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } =
  userSlice.actions

export default userSlice.reducer
