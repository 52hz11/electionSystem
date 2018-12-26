pragma solidity ^0.4.22;
contract election {
	struct elector {
		bytes32 name;
		bool voted;
		uint province;
		uint city;
		uint region;
		uint voteCount;
		uint power;		//0为普通民众，1为市级代表，2为省级代表，3为国家代表，4为国家主席
	}
	uint public currentState;	//0为选举市级代表，1为选举省级代表，2为选举国家代表，3为选举国家主席
	uint public maxProvinceNum;
	uint public maxCityNum;
	uint public maxRegionNum;
	address public chairperson;
	address[] public validAddr;
	mapping (address => elector) public electors;
	mapping (bytes32 => address) public findPerson;
	constructor() public{
		currentState = 0;
		chairperson = msg.sender;
		maxProvinceNum = 0;
		maxCityNum = 0;
		maxRegionNum = 0;
	}

	function addElectors(address[] memory addresses, bytes32[] memory names, uint[] memory provinces, uint[] memory cities, uint[] memory regions) public {
		require (msg.sender == chairperson, "only chairperson can add electors");
		for(uint i = 0; i < addresses.length; i++){
			electors[addresses[i]].name = names[i];
			electors[addresses[i]].voted = false;
			electors[addresses[i]].province = provinces[i];
			electors[addresses[i]].city = cities[i];
			electors[addresses[i]].region = regions[i];
			electors[addresses[i]].voteCount = 0;
			electors[addresses[i]].power = 0;
			findPerson[names[i]] = addresses[i];
			if(maxRegionNum < regions[i]){
				maxRegionNum = regions[i];
			}
			if(maxCityNum < cities[i]){
				maxCityNum = cities[i];
			}
			if(maxProvinceNum < provinces[i]){
				maxProvinceNum = provinces[i];
			}
			validAddr.push(addresses[i]);
		}
	}

	function addElector(address addresses, bytes32 names, uint provinces, uint cities, uint regions) public {
		require (msg.sender == chairperson, "only chairperson can add electors");
		electors[addresses].name = names;
		electors[addresses].voted = false;
		electors[addresses].province = provinces;
		electors[addresses].city = cities;
		electors[addresses].region = regions;
		electors[addresses].voteCount = 0;
		electors[addresses].power = 0;
		findPerson[names] = addresses;
		if(maxRegionNum < regions){
			maxRegionNum = regions;
		}
		if(maxCityNum < cities){
			maxCityNum = cities;
		}
		if(maxProvinceNum < provinces){
			maxProvinceNum = provinces;
		}
		validAddr.push(addresses);
	}

	function voteTo(bytes32 toVoteName) public {
		elector storage sender = electors[msg.sender];
		require(!sender.voted, "this elector already voted.");
		require(sender.power >= currentState,"this elector do not have enough power");
		elector storage toVote = electors[findPerson[toVoteName]];
		if(currentState == 0){
			require(sender.region == toVote.region,"elector and to vote person must be in the same region");	
		}
		else if(currentState == 1){
			require(sender.city == toVote.city,"elector and to vote person must be in the same city");
		}
		else if(currentState == 2){
			require(sender.province == toVote.province,"elector and to vote person must be in the same province");
		}
		sender.voted = true;
		toVote.voteCount++;
	}

	function finishState() public {
		require (msg.sender == chairperson, "only chairperson can finish state");
		if(currentState == 0){
			uint[] regionMaxCount;
			address[] regionElected;
			regionMaxCount.length = maxRegionNum;
			regionElected.length = maxRegionNum;
			for(uint i = 0; i < maxRegionNum; i++){
				regionMaxCount[i] = 0;
			}
			for(i = 0; i < validAddr.length; i++){
				elector storage tmp0 = electors[validAddr[i]]; 
				if(tmp0.power >= 0 && tmp0.voteCount > regionMaxCount[tmp0.region - 1]){
					regionMaxCount[tmp0.region - 1] = tmp0.voteCount;
					regionElected[tmp0.region - 1] = validAddr[i];
				}                     
			}
			for(i = 0; i < regionElected.length; i++){
				electors[regionElected[i]].power = 1;				
			}
			currentState = 1;
		}
		else if(currentState == 1){
			uint[] cityMaxCount;
			address[] cityElected;
			cityMaxCount.length = maxCityNum;
			cityElected.length = maxCityNum;
			for(i = 0; i < maxCityNum; i++){
				cityMaxCount[i] = 0;
			}
			for(i = 0; i < validAddr.length; i++){
				elector storage tmp1 = electors[validAddr[i]]; 
				if(tmp1.power >= 1 && tmp1.voteCount > cityMaxCount[tmp1.city - 1]){
					cityMaxCount[tmp1.city - 1] = tmp1.voteCount;
					cityElected[tmp1.city - 1] = validAddr[i];
				}                     
			}
			for(i = 0; i < cityElected.length; i++){
				electors[cityElected[i]].power = 2;			
			}
			currentState = 2;
		}
		else if(currentState == 2){
			uint[] provinceMaxCount;
			address[] provinceElected;
			provinceMaxCount.length = maxProvinceNum;
			provinceElected.length = maxProvinceNum;
			for(i = 0; i < maxProvinceNum; i++){
				provinceMaxCount[i] = 0;
			}
			for(i = 0; i < validAddr.length; i++){
				elector storage tmp2 = electors[validAddr[i]]; 
				if(tmp2.power >= 2 && tmp2.voteCount > provinceMaxCount[tmp2.province - 1]){
					provinceMaxCount[tmp2.province - 1] = tmp2.voteCount;
					provinceElected[tmp2.province - 1] = validAddr[i];
				}                     
			}
			for(i = 0; i < provinceElected.length; i++){
				electors[provinceElected[i]].power = 3;			
			}
			currentState = 3;
		}
		else if(currentState == 3){
			uint countryMaxCount;
			address countryElected;
			for(i = 0; i < validAddr.length; i++){
				elector storage tmp3 = electors[validAddr[i]]; 
				if(tmp3.power >= 3 && tmp3.voteCount > countryMaxCount){
					countryMaxCount = tmp3.voteCount;
					countryElected = validAddr[i];
				}                     
			}
			electors[countryElected].power = 4;
			currentState = 4;
		}
		for(i = 0; i < validAddr.length; i++){
			electors[validAddr[i]].voteCount = 0;
			electors[validAddr[i]].voted = false;
		}
	}
}
