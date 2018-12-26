import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import electionArtifact from '../../build/contracts/election.json'

const Election = contract(electionArtifact)

const App = {
  byte32ToString: function(bytestr){
    var end = bytestr.length - 1
    while(bytestr[end] == '0'){
      end--
    }
    if(end % 2 == 0)
      end++
    bytestr = bytestr.substring(2,end + 1)
    console.log(bytestr)
    var index = 0
    var byteArr = new Array()
    while(index < bytestr.length){
      var num = parseInt(bytestr.substring(index,index+2),16)
      index += 2
      byteArr.push(num)
    }
    var str = '',  
        _arr = byteArr 
    for(var i = 0; i < _arr.length; i++) {  
        var one = _arr[i].toString(2),  
            v = one.match(/^1+?(?=0)/);  
        if(v && one.length == 8) {  
            var bytesLength = v[0].length  
            var store = _arr[i].toString(2).slice(7 - bytesLength)
            for(var st = 1; st < bytesLength; st++) {  
                store += _arr[st + i].toString(2).slice(2)
            }  
            str += String.fromCharCode(parseInt(store, 2))
            i += bytesLength - 1
        } else {  
            str += String.fromCharCode(_arr[i])
        }  
    }  
    return str
  },

	start: function(){
		const self = this
		Election.setProvider(web3.currentProvider)
	},

	doElection: function(){
    const self = this
    const accountText = document.getElementById('accountText').value
    const contractText = document.getElementById('contractText').value
    const voted = document.getElementById('voted').value
    if(accountText.length == 0){
      alert('the account address can not be empty')
      return
    }
    if(contractText.length == 0){
      alert('the contract address can not be empty')
      return
    }
    if(voted.length == 0){
      alert('the voted can not be empty')
    }
    Election.at(contractText).then(function(instance){
      return instance.voteTo(voted,{from : accountText,gas: 3400000}) 
    }).then(function(){
      alert('vote succeed')
      self.getElectorInfo()
    }).catch(function(e){
      alert('投票失败，请确认合约和账户地址正确，以及你有足够的权限！！')
      console.log(e)
    })
  },

  getElectorInfo: function(){
    const self = this
    const accountText = document.getElementById('accountText').value
    const contractText = document.getElementById('contractText').value
    if(accountText.length == 0){
      alert('the account address can not be empty')
      return
    }
    if(contractText.length == 0){
      alert('the contract address can not be empty')
      return
    }
    const electorName = document.getElementById('electorName')
    const electorVoted = document.getElementById('electorVoted')
    const electorProvince = document.getElementById('electorProvince')
    const electorCity = document.getElementById('electorCity')
    const electorRegion = document.getElementById('electorRegion')
    const electorPower = document.getElementById('electorPower')
    const electorVoteCount = document.getElementById('electorVoteCount')
    Election.at(contractText).then(function(instance){
      return instance.electors.call(accountText, {from: accountText,gas: 3400000})
    }).then(function(value){
      value = value.valueOf()
      console.log(value)
      console.log(self)
      if(value[2].toNumber() != 0){
        electorName.innerHTML = self.byte32ToString(value[0].toString())
        electorVoted.innerHTML = value[1]
        electorProvince.innerHTML = value[2].toNumber()
        electorCity.innerHTML = value[3].toNumber()
        electorRegion.innerHTML = value[4].toNumber()
        electorPower.innerHTML = value[6].toNumber()
        electorVoteCount.innerHTML = value[5].toNumber()
      }
      else{
        alert('此账户不在选举者名单内！')
        electorName.innerHTML = '暂无信息'
        electorVoted.innerHTML = '暂无信息'
        electorProvince.innerHTML = '暂无信息'
        electorCity.innerHTML = '暂无信息'
        electorRegion.innerHTML = '暂无信息'
        electorPower.innerHTML = '暂无信息'
        electorVoteCount.innerHTML = '暂无信息'
      }
    }).catch(function(e){
      console.log(e)
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