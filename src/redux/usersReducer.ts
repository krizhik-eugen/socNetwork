import {DispatchTypes} from './redux-store';
import {usersAPI} from "../api/api";
import {Dispatch} from 'redux';

export type LocationType = {
    city: string
    country: string
}
export type UserType = {
    id: number
    photos: { small: string | null, large: string | null }
    uniqueUrlName: string | null
    name: string
    status: string | null
    location: LocationType
    followed: boolean
}
export type UsersPageType = {
    users: Array<UserType>
    pageSize: number
    usersTotalCount: number
    currentPage: number
    isFetching: boolean
    followingProcess: number[]
}

const FOLLOW = 'FOLLOW'
const UNFOLLOW = 'UNFOLLOW'
const SET_USERS = 'SET-USERS'
const SET_CURRENT_PAGE = 'SET-CURRENT-PAGE'
const SET_USERS_TOTAL_COUNT = 'SET-USERS-TOTAL-COUNT'
const SET_FETCHING = 'SET-FETCHING'
const SET_FOLLOWING_PROCESS = 'SET-FOLLOWING-PROCESS'

export const follow = (userID: number) => ({type: FOLLOW, userID}) as const
export const unfollow = (userID: number) => ({type: UNFOLLOW, userID}) as const
export const setUsers = (users: Array<UserType>) => ({type: SET_USERS, users}) as const
export const setCurrentPage = (page: number) => ({type: SET_CURRENT_PAGE, page}) as const
export const setUsersTotalCount = (count: number) => ({type: SET_USERS_TOTAL_COUNT, count}) as const
export const setFetching = (isFetching: boolean) => ({type: SET_FETCHING, isFetching}) as const
export const setFollowingProcess = (inProcess: boolean, id: number) => ({
    type: SET_FOLLOWING_PROCESS,
    inProcess,
    id
}) as const

export const getUsersFromServer = (currentPage: number, pageSize: number) => (dispatch: Dispatch<DispatchTypes>) => {
    dispatch(setFetching(true))
    usersAPI.getUsers(currentPage, pageSize)
        .then(data => {
            dispatch(setUsers(data.items));
            dispatch(setUsersTotalCount(data.totalCount));
            dispatch(setFetching(false))
        })
}
export const changePage = (p: number, pageSize: number) => (dispatch: Dispatch) => {
    dispatch(setCurrentPage(p));
    dispatch(setFetching(true));
    usersAPI.getUsers(p, pageSize)
        .then(data => {
            dispatch(setUsers(data.items));
            dispatch(setFetching(false))
        })
}
export const setUnFollow = (id: number) => (dispatch: Dispatch) => {
    dispatch(setFollowingProcess(true, id));
    usersAPI.setUnfollowed(id)
        .then(data => {
            if (data.resultCode === 0) {
                dispatch(unfollow(id))
            }
            dispatch(setFollowingProcess(false, id))
        })
    dispatch(unfollow(id))
}
export const setFollow = (id: number) => (dispatch: Dispatch) => {
    dispatch(setFollowingProcess(true, id));
    usersAPI.setFollowed(id)
        .then(data => {
            if (data.resultCode === 0) {
                dispatch(follow(id))
            }
            dispatch(setFollowingProcess(false, id))
        })
    dispatch(follow(id))
}

let initialState: UsersPageType = {
    users: [],
    pageSize: 10,
    usersTotalCount: 0,
    currentPage: 1,
    isFetching: false,
    followingProcess: []
}

const usersReducer = (state = initialState, action: DispatchTypes): UsersPageType => {
    switch (action.type) {
        case FOLLOW:
            return {
                ...state, users: state.users.map(u => (u.id === action.userID) ? {...u, followed: true} : u)
            }
        case UNFOLLOW:
            return {
                ...state, users: state.users.map(u => (u.id === action.userID) ? {...u, followed: false} : u)
            }
        case SET_USERS:
            return {
                ...state, users: action.users
            }
        case SET_CURRENT_PAGE:
            return {
                ...state, currentPage: action.page
            }
        case SET_USERS_TOTAL_COUNT:
            return {
                ...state, usersTotalCount: action.count
            }
        case SET_FETCHING:
            return {
                ...state, isFetching: action.isFetching
            }
        case SET_FOLLOWING_PROCESS:
            return {
                ...state,
                followingProcess: action.inProcess
                    ? [...state.followingProcess, action.id]
                    : state.followingProcess.filter(id => id !== action.id)
            }
        default:
            return state
    }
}
export default usersReducer