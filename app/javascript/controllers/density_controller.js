import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { class: { type: String, default: "density--compact" } }

  connect() {
    this.#load()
  }

  toggle() {
    document.body.classList.toggle(this.classValue)
    this.#save()
  }

  #save() {
    const on = document.body.classList.contains(this.classValue)
    try { localStorage.setItem("ui-density", on ? "compact" : "normal") } catch {}
  }

  #load() {
    try {
      const value = localStorage.getItem("ui-density")
      if (value === "compact") document.body.classList.add(this.classValue)
    } catch {}
  }
}


