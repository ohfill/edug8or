# edug8or

## Project Goals
 - provide a singular source for current updates, primarily focused on recent news
 - support as many sources / platforms as possible while reducing duplicate events
 - [stretch] be customizable for individualization of custom installs

## To Do
 - interface for an "event"
 - modular event system to add/remove/modify as needed
 - baseline list of sources
 	- threatpost
	- cnn
	- hackernews
	- reddit (r/politics, r/news, r/worldnews to start)
	- twitter
 - caching/db system for event queuing delivery/distribution
 	- eventually redis/mongo, start with just in memory store
	- have unique key on url to help avoid dups
		- should do some unfurling of links to remove tracking query params and redirects
	- build in a sources meta item to show different places that report same event
 - websocket interface to basic front end
 	- start with just JSON printing to cli

