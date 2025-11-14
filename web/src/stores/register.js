import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { createMachine, createActor, assign } from "xstate";
import { useLocalStorage, useFetch } from '@vueuse/core'
import { useJwt } from '@vueuse/integrations/useJwt'

export const useRegisterStore = defineStore('register', () => {
    const currentState = ref({})


    const fetchEmail = useFetch(new URL('register/email', import.meta.env.VITE_URL_AUTH), {

        immediate: false,
        initialData: "NO TOKEN",
        onFetchError: ({data, error}) => {
            Error.value = data.message
        }
    })

    const Token = computed(() => useJwt(fetchEmail.data.value.token))

    const Error = ref('')

    const machine = createMachine(
    {
    context: {
      count: 0,
      token: null,
      feedback: "Some feedback",
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
          error: [
            {
              target: "register-error",
              actions: [],
              meta: {},
            },
          ],
        },
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
          error: [
            {
              target: "register-error",
              actions: [],
              meta: {},
            },
          ],
        },
      },
      "register-error": {
        on: {
          back: [
            {
              target: "register-email",
              actions: [],
              meta: {},
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
            },
          ],
          register: [
            {
              target: "register-error",
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
      increment: ({ context, event }) => {},
      decrement: ({ context, event }) => {},
    },
    actors: {},
    guards: {},
    delays: {},
  },
)
    const actor = createActor(machine)
    actor.subscribe((state) => {
        currentState.value = state
    })

    return { actor, currentState, Token, Error, register: fetchEmail }
})
