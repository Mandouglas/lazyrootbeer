String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }

const skills = require('./skills');

module.exports = function AutoUse(mod){		//Adding Id´s manually if detection is fucked.

let enabled = true,							// 51028 = https://teralore.com/de/item/51028/
	debug = false,							// 98406 = https://teralore.com/de/item/98406/
	brooch = {								// 98405 = https://teralore.com/de/item/98405/
		id : [51028, 98406, 98405, 98404],	// 98404 = https://teralore.com/de/item/98404/
		cooldown : 0
	},										// Cooldown calc should be correct nothing to change.
	rootbeer = {
		id : 80081,
		amount : 0,
		cooldown : 0
	},
	useBroochOn,
	useRootBeerOn,
	useOutOfCombat,
	delay;

	mod.command.add('au', (arg) => {
		if(arg){
			arg = arg.toLowerCase();
			if(arg === 'on'){
				enabled = true;
				mod.command.message('[Auto Use] Enabled.'.clr('00FF33'));
			}
			else if(arg === 'off'){
				enabled = false;
				mod.command.message('[Auto Use] Disabled.'.clr('FF0000'));
			}
			else if(arg === 'debug'){
				debug = !debug;
				mod.command.message(`[Auto Use] Debug Status : ${debug}`);
			}
			else if(arg === 'help'){
				mod.command.message('[Auto Use] Commands : debug | on | off')
			}
		}
		else mod.command.message('[Auto Use] Commands : debug | on | off');
	});

	let useItem = (item, loc, w) => {
		mod.send('C_USE_ITEM', 3, {
			gameId: mod.game.me.gameId,
			id: item,
			//dbid: { low: 0, high: 0, unsigned: true },
			//target: { low: 0, high: 0, unsigned: true },
			amount: 1,
			dest: { x: 0, y: 0, z: 0 },
			loc: loc,
			w: w,
			unk1: 0,
			unk2: 0,
			unk3: 0,
			unk4: true
        });
        if(debug) console.log('Used : ' + item);
	};

	let handle = (info) => {
		if((useOutOfCombat || mod.game.me.inCombat) && !mod.game.me.inBattleground){
			if(useBroochOn.includes(info.skill.id) && Date.now() > brooch.cooldown) setTimeout(useItem, delay, brooch.id, info.loc, info.w);
			if(useRootBeerOn.includes(info.skill.id) && rootbeer.amount > 0 && Date.now() > rootbeer.cooldown) setTimeout(useItem, delay, rootbeer.id, info.loc, info.w);
		}
	}; 

	mod.game.on('enter_game', () => {
        useBroochOn = skills[mod.game.me.class].useBroochOn;
        useRootBeerOn = skills[mod.game.me.class].useRootBeerOn;
        useOutOfCombat = skills[mod.game.me.class].useOutOfCombat;
        delay = skills[mod.game.me.class].delay;
    });

 	mod.hook('C_USE_ITEM', 3, event => {
 		if(debug) console.log('ID of Item Used: ' + event.id);
 	});

	mod.hook('S_INVEN', 16, event => {
		if(!enabled) return;
		const broochinfo = event.items.find(item => item.slot === 20);
		const beer = event.items.find(item => item.id === rootbeer.id);
		if(broochinfo) brooch.id = broochinfo.id;
		if(beer) rootbeer.amount = beer.amount;
	});

	mod.hook('C_START_SKILL', 7, {order: Number.NEGATIVE_INFINITY}, event => {
		if(debug){
			const Time = new Date();
			console.log('Time: ' + Time.getHours() + ':' + Time.getMinutes() + ' | Skill ID : ' + event.skill.id);
		}
		if(!enabled) return;
		handle(event);
	});

	mod.hook('S_START_COOLTIME_ITEM', 1, {order: Number.NEGATIVE_INFINITY}, event => {
		if(!enabled) return;
		if(event.item === brooch.id) brooch.cooldown = Date.now() + event.cooldown*1000;
		else if(event.item === rootbeer.id) rootbeer.cooldown = Date.now() + event.cooldown*1000;
	});

}
