import enConts from "../data/localEn.json" with { type: "json" };
import jpConts from "../data/localJp.json" with { type: "json" };


export function Localize(type) {
	var jp = false;
	jp = (type == "jp" ? true : false);
	
	var locDiv;
	var locConts = (jp ? jpConts : enConts);
	{
			locDiv = document.getElementById('aboutGame');
			locDiv.innerHTML = '';
			locDiv.innerHTML += locConts[0].conts;
	}
	{
			locDiv = document.getElementById('plan-title');
			locDiv.innerHTML = '';
			locDiv.innerHTML += locConts[1].conts[0].title;
	}
	{
			locDiv = document.getElementById('2d-title');
			locDiv.innerHTML = '';
			locDiv.innerHTML += locConts[1].conts[1].title;
	}
	{
			locDiv = document.getElementById('3d-title');
			locDiv.innerHTML = '';
			locDiv.innerHTML += locConts[1].conts[2].title;
	}
	{
			locDiv = document.getElementById('pro-title');
			locDiv.innerHTML = '';
			locDiv.innerHTML += locConts[1].conts[3].title;
	}
	return;
	{
			locDiv = document.getElementById('aboutGame');
			locDiv.innerHTML = '';
			locDiv.innerHTML += locConts[0].conts;
			return;
	}
		{
			locDiv = document.getElementById('exp');
	for (var i = 0; i < locConts[1].conts.length; i++) {
		if (locConts[1].conts.length < i)
			continue;
		
		locDiv.innerHTML += `
			<div class="d-flex flex-column flex-md-row justify-content-between mb-5">
				<div class="flex-grow-1">
					<h3 class="mb-0">`+locConts[1].conts[i].job+`</h3>
					<div class="subheading mb-3">`+locConts[1].conts[i].company+`</div>
				</div>
				<div class="flex-shrink-0"><span class="text-primary">`+locConts[1].conts[i].time+`</span></div>
            </div>
			`;
	}	
		}
		{
			locDiv = document.getElementById('cert');
	for (var i = 0; i < locConts[2].conts.length; i++) {
		if (locConts[2].conts.length < i)
			continue;
		
		locDiv.innerHTML += `
			<div class="d-flex flex-column flex-md-row justify-content-between mb-5">
                        <div class="flex-grow-1">
                            <h3 class="mb-0">`+locConts[2].conts[i].name+`</h3>
                            <div class="subheading mb-3">`+locConts[2].conts[i].extra+`</div>
                        </div>
                        <div class="flex-shrink-0"><span class="text-primary">`+locConts[2].conts[i].data+`</span></div>
            </div>
			`;
	}
		}
		{
			locDiv = document.getElementById('edu');
	for (var i = 0; i < locConts[3].conts.length; i++) {
		if (locConts[3].conts.length < i)
			continue;
		
		locDiv.innerHTML += `
			<div class="d-flex flex-column flex-md-row justify-content-between mb-5">
                        <div class="flex-grow-1">
                            <h3 class="mb-0">`+locConts[3].conts[i].school+`</h3>
                            <div class="subheading mb-3">`+locConts[3].conts[i].type+`</div>
                            <div>`+locConts[3].conts[i].degree+`</div>
                            <p>`+locConts[3].conts[i].extra+`</p>
                        </div>
                        <div class="flex-shrink-0"><span class="text-primary">`+locConts[3].conts[i].time+`</span></div>
                    </div>
			`;
	}
		}
	
    
}

export function getUrlParameter(name) {
  // Get the query string part of the current URL
  const queryString = window.location.search;

  // Create a URLSearchParams object from the query string
  const params = new URLSearchParams(queryString);

  // Return the value of the specified parameter
  return params.get(name);
}

export async function loadMarkdown(url, elementId) {
    try {
        const res = await fetch(url);
        const md = await res.text();
        const el = document.getElementById(elementId);
        if (el) {
            el.innerHTML = marked.parse(md);
        }
    } catch (err) {
        console.error(`Failed to load markdown from ${url}:`, err);
    }
}