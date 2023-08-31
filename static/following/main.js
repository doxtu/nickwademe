(async function(){
  const state = {}

  const renderFunctions = [
    () => {
      const followingPeopleList = document.querySelector('.following-people-list')
      followingPeopleList.innerHTML = ""
      if(typeof state.following === 'undefined') return
      if(typeof state.filterValue === 'undefined') return
      
      state.following.filter((person) => new RegExp(`${state.filterValue.toLowerCase()}`).test(person['name'].toLowerCase()) || person['contacts'].split(',').reduce((acc, d) => acc || new RegExp(`${state.filterValue.toLowerCase()}`).test(d), false)).forEach((person) => { 
        const name = person['name'] || "" 
        const contacts = person['contacts'] || "" 
        const contactsArray = contacts.split(',').reduce((acc, d) => {
          const httpChecker = new RegExp('http')
          const isHttp = httpChecker.test(d)
          if(isHttp) acc += `<li><a href="${d}" target="_blank">${d}</a></li>`
          else acc += `<li>${d}</li>`
          return acc
        }, "")
        const element = document.createElement('li')
        element.innerHTML = `<h1>${name}</h1><ul>${contactsArray}</ul>`
        followingPeopleList.appendChild(element)
      }) 
      
      const loadingSpinner = document.querySelector('.loading-spinner')
      loadingSpinner.style.display = 'none'
    }
  ]

  async function init(state){
    if(typeof fetch === 'undefined') return
    try{
      const followingResponse = await fetch('http://nickwade.me/following/people')
      const followingJson = await followingResponse.json()
      const following = followingJson["data"] || []
      state['following'] = following.map((person) => ({'name': person[0], 'contacts': person[1]})) || []
      state['filterValue'] = ""
    } catch(err) {
      console.error(err)
    }
    return state
  }

  function render(){
    renderFunctions.forEach(f => f())
  }

  //event listeners
  const filterInput = document.querySelector('div.filter-people input')
  filterInput.addEventListener('keyup', (e)=>{
    const filterValue = filterInput.value
    state['filterValue'] = filterValue
    render()
  })

  //load state
  await init(state)
  //start rendering
  render()
})()
