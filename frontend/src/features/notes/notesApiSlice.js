import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit"

import { apiSlice } from "../../app/api/apiSlice"

const notesAdapter = createEntityAdapter({
    sortComparer:(a,b)=> ( a.completed === b.completed)?0:a.completed ? 1: -1
})

const initialState = notesAdapter.getInitialState()

export const notesApiSlice = apiSlice.injectEndpoints({
    endpoints:builder=>({
        getNotes:builder.query({
            query:()=>'/notes',
            validateStatus:(response,result)=>{
                return response.status === 200 && !result.isError
            },
            // keepUnusedDataFor: 5,
            transformResponse:responseData=>{
                const loadednotes = responseData.map(note=>{
                    note.id = note._id
                    return note
                });
                return notesAdapter.setAll(initialState,loadednotes)
            },
            providesTags:(result,error,arg)=>{
                if (result?.id){
                    console.log("result: ",result)
                    return [
                        {type:'Note', id:'LIST'},
                        ...result.ids.map(id=>({type:'Note', id}))
                    ]
                } else return [{type:'Note', id:'LIST'}]
            }
        }), 
        addNewNote:builder.mutation({
            query:initialNote => ({
                url:'/notes',
                method:'POST',
                body: {
                    ...initialNote
                }
            }),
            invalidatesTags:[
                {type:'Note', id:"LIST"}
            ]
        }), 
        updateNote:builder.mutation({
            query:initialNote => ({
                url:'/notes',
                method:'PATCH',
                body:{
                    ...initialNote
                }
            }),
            invalidatesTags:(result,error, arg)=>[{type:'Note', id:arg.id}]
        }), 
        deleteNote: builder.mutation({
            query:({id})=>({
                url:`/notes/${id}`,
                method:'DELETE',
                body:{id}
            }),
            invalidatesTags:(result,error,arg)=>[{type:'Note', id:arg.id}]
        })

         

        
    }),
})

export const {
    useGetNotesQuery,
    useAddNewNoteMutation,
    useDeleteNoteMutation,
    useUpdateNoteMutation
} = notesApiSlice

export const selectNotesResult = notesApiSlice.endpoints.getNotes.select()

// memoization
export const selectNotesData = createSelector(
    selectNotesResult,
    notesResult => notesResult.data
)

export const {
    selectAll : selectAllNotes,
    selectById : selectNoteById,
    selectIds : selectNoteIds
} = notesAdapter.getSelectors(state =>selectNotesData(state) ?? initialState)