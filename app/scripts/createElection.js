import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import electionArtifact from '../../build/contracts/election.json'

const Election = contract(electionArtifact)

const App = {
	start: function(){
		const self = this
		Election.setProvider(web3.currentProvider)
	},

	createElection: function(){
		const account = document.getElementById('accountText').value
    if(account.length == 0){
      alert('the account can not be empty')
      return
    }
		const contractText = document.getElementById('contractText')
		Election.new({from : account, gas: 3400000}).then(function(instance){
			console.log(instance.address)
			contractText.innerHTML = instance.address
		}).catch(function(err){
			alert(err)
		})
	}
}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:8545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  }
  
  App.start()
})