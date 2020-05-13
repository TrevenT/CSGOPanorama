'use strict';


var EOM_Skillgroup = (function () {


	var _m_pauseBeforeEnd = 1.5;
	var _m_cP = $.GetContextPanel();


                                                     

	_m_cP.Data().m_retries = 0;

	var _DisplayMe = function()
	{
		                                     
		    
		   	             
		    

		if ( !_m_cP.bSkillgroupDataReady )
		{
			return false;
		}

		var oSkillgroupData = _m_cP.SkillgroupDataJSO;

		var compWins = oSkillgroupData[ "num_wins" ];
		var oldRank = oSkillgroupData[ "old_rank" ];
		var newRank = oSkillgroupData[ "new_rank" ];
		var currentRank = oldRank < newRank ? newRank : oldRank;
		var winsNeededForRank = 10;

		var oData = {
			currentRank: currentRank,
			compWins: compWins,
			rankInfo: '',
			rankDesc: '',
			mode: GameStateAPI.GetGameModeInternalName( true ),
			model: '',
			image: ''
		};

		_m_cP.SetDialogVariable( 'eom_mode', GameStateAPI.GetGameModeName( true ) );

		if ( currentRank < 1 && compWins >= winsNeededForRank )
		{	
			                                              
			_LoadAndShowRank();
			
			oData.rankInfo = $.Localize( '#eom-skillgroup-expired', _m_cP );
			oData.image = 'file://{images}/icons/skillgroups/skillgroup_expired.svg';
		}
		else if ( currentRank < 1 )
		{
			                                   
			var matchesNeeded = winsNeededForRank - compWins;
			_LoadAndShowRank();
			_m_cP.SetDialogVariableInt( 'num_matches', matchesNeeded );
			var winNeededString = ( matchesNeeded === 1 ) ? '#eom-skillgroup-needed-win' : '#eom-skillgroup-needed-wins';

			oData.rankInfo = $.Localize( winNeededString, _m_cP );
			oData.image = 'file://{images}/icons/skillgroups/skillgroup0.svg';
		}
		else if ( currentRank >= 1 )
		{
			                         
			var modePrefix = ( oData.mode === 'scrimcomp2v2' ) ? 'skillgroup_wingman' : 'skillgroup';
			var modelPath = 'models/inventory_items/skillgroups/' + modePrefix + currentRank + '.mdl';
			oData.model = modelPath;
			oData.rankInfo = $.Localize( 'RankName_' + currentRank );
			oData.rankDesc = $.Localize( '#eom-skillgroup-name', _m_cP );

			if ( oldRank < newRank )                             
			{
				_m_pauseBeforeEnd = 3.0;
				_LoadAndShowNewRankReveal();
			}
			else                            
			{
				_LoadAndShowRank();
			}
		}

		_FilloutRankData( oData );
	
		return true;
	};

	function _LoadAndShowRank ()
	{
		_m_cP.FindChildInLayoutFile( "id-eom-skillgroup" ).BLoadLayoutSnippet( "eom-skillgroup-display" );
	}

	function _LoadAndShowNewRankReveal ()
	{
		_m_cP.FindChildInLayoutFile( "id-eom-skillgroup" ).BLoadLayoutSnippet( "eom-skillgroup-reveal" );
		
		$.Schedule(
			0.75,
			_ShowIcon
		);

		$.Schedule( 0.75, _PlayParticles );

		var elBg = _m_cP.FindChildTraverse( 'id-eom-skillgroup-bg' );
		elBg.AddClass( 'eom-skillgroup-bg-anim' );

		var elNew = _m_cP.FindChildTraverse( 'id-eom-skillgroup__newrank' );
		elNew.AddClass( 'eom-skillgroup-bg-anim' );

		var elFlare = _m_cP.FindChildTraverse( 'id-eom-skillgroup__flare' );
		elFlare.AddClass( 'eom-skillgroup-new-anim' );

		var elInfo = _m_cP.FindChildTraverse( 'id-eom-skillgroup__info' );
		elInfo.AddClass( 'eom-skillgroup-bg-anim' );
	}

	function _ShowIcon ()
	{
		var elModel = _m_cP.FindChildTraverse( 'id-eom-skillgroup-model' );
		elModel.AddClass( 'eom-skillgroup__model-reveal' );
		$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.XP.NewSkillGroup', 'MOUSE' );
	}

	function _PlayParticles ()
	{
		var elModel = _m_cP.FindChildTraverse( 'SkillGroupParticles' );

		elModel.RemoveClass( 'hidden' );
		elModel.SetCameraPosition( -15.10, 0.00, 0.00 );
		elModel.SetCameraAngles( 0.00,  0.00,  0.00 );
		elModel.AddParticleSystem( 'nuke_sparks1_glow', '', false );
		elModel.AddParticleSystem( 'nuke_sparks1_core', '', false );

		$.Schedule( 1, function() { elModel.AddClass( 'hidden' ); } );
	}

	function _FilloutRankData ( oData )
	{
		var winString = ( oData.compWins === 1 ) ? '#eom-skillgroup-win' : '#eom-skillgroup-wins';
		var elDesc = _m_cP.FindChildInLayoutFile( "id-eom-skillgroup__wins-desc" );
		elDesc.text = $.Localize( winString, _m_cP );

		_m_cP.FindChildInLayoutFile( "id-eom-skillgroup__rankname-label" ).text = oData.rankInfo;
		_m_cP.FindChildInLayoutFile( "id-eom-skillgroup__wins-label" ).text = oData.compWins;

		var elRankDesc = _m_cP.FindChildInLayoutFile( "id-eom-skillgroup__rankname-desc" );
		
		if ( oData.rankDesc )
		{
			elRankDesc.RemoveClass( 'hidden' );
			elRankDesc.text = oData.rankDesc;
		}

		if ( oData.model )
		{
			var elModel = _m_cP.FindChildInLayoutFile( "id-eom-skillgroup-model" );
			elModel.RemoveClass( 'hidden' );
			elModel.SetScene(
				"resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
				oData.model,
				false
			);
		}
		else
		{
			var elImage = _m_cP.FindChildInLayoutFile( "id-eom-skillgroup-image" );
			elImage.RemoveClass( 'hidden' );
			elImage.SetImage( oData.image );
		}
	}

	                                                         
	                                                                      
	  
	  

	function _Start() 
	{
				
		if ( _DisplayMe() )
		{
			EndOfMatch.SwitchToPanel( 'eom-skillgroup' );
			EndOfMatch.StartDisplayTimer( _m_pauseBeforeEnd );

			$.Schedule( _m_pauseBeforeEnd, _End );
		}
		else
		{
			_End();
		}
	}

	function _End() 
	{
		$.DispatchEvent( 'EndOfMatch_ShowNext' );
	}

	function _Shutdown()
	{
	}

	                      
	return {
		name: 'eom-skillgroup',
		Start: _Start,
		Shutdown: _Shutdown,
	};
})();


                                                                                                    
                                           
                                                                                                    
(function () {

	EndOfMatch.RegisterPanelObject( EOM_Skillgroup );

})();
