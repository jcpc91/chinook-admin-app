import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { createMachine, createActor, fromPromise } from "xstate";
import { useLocalStorage, useSessionStorage, useFetch } from '@vueuse/core'

export const useRegisterStore = defineStore('register', () => {
    const currentState = ref({})


    const { data: token, loading, error, execute: register, isFetching, isFinished} = useFetch('https://jsonplaceholder.typicode.com/posts/1', {

        immediate: false,
        initialData: "",
        afterFetch: (ctx) => {
            // TODO: fake token
            ctx.data = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"
            return ctx
        }
    })
        .get()
        .json()

    const Token = computed(() => token.value?? "NO TOKEN")
    const machine = createMachine(
    {
        context: {
            count: 0,
        },
        id: "stepper",
        initial: "register-email",
        states: {
            "register-email": {
                description:
                "This state represents the step where the user enters their email address. It is the first step in the process.",
                on: {
                    next: [
                        {
                        target: "register-token",
                        actions: [
                            {
                            type: "increment",
                            },
                        ],
                        meta: {},
                        },
                    ],
                },
                entry: [() => console.log("register-email entry")],
            },
            "register-token": {
                description:
                "In this state, the user is expected to enter a token, which is typically sent to their email for verification purposes.",
                on: {
                next: [
                    {
                    target: "register-password",
                    actions: [
                        {
                        type: "increment",
                        },
                    ],
                    },
                ],
                back: [
                    {
                    target: "register-email",
                    actions: [
                        {
                        type: "decrement",
                        },
                    ],
                    },
                ],
                },
            },
            "register-password": {
                description:
                "This is the final state where the user sets or enters their password. Once completed, the stepper process is finished.",
                on: {
                back: [
                    {
                    target: "register-token",
                    actions: [
                        {
                        type: "decrement",
                        },
                    ],
                    },
                ],
                fin: [
                    {
                    target: "register-fin",
                    actions: [],
                    meta: {},
                    },
                ],
                },
            },
            "register-fin": {
                type: "final",
            },
        },
    },
    {
        actions: {
        increment: ({ context, _event }) => {
            context.count = context.count + 1;
        },
        decrement: ({ context, _event }) => {
            context.count = context.count - 1;
        },
        },
        actors: {

        },
        guards: {},
        delays: {},
    },
)
    const actor = createActor(machine)
    actor.subscribe((state) => {
        console.log("State changed to:", state.value)
        currentState.value = state
    })

    return { actor, currentState, Token, register, loading, error, isFetching, isFinished }
})
