import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { createMachine, createActor } from "xstate";
export const useRegisterStore = defineStore('register', () => {
    const currentState = ref({})
    const machine = createMachine({
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
              actions: [],
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
              actions: [],
            },
          ],
          back: [
            {
              target: "register-email",
              actions: [],
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
              actions: [],
            },
          ],
        },
      },
    },

  })
    const actor = createActor(machine)
    actor.subscribe((state) => {
        console.log("State changed to:", state.value)
        currentState.value = state
    })

    return { actor, currentState }
})
