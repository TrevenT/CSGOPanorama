'use strict';


var EOM_Skillgroup = (function () {


	var _m_pauseBeforeEnd = 2.0;	
	var _m_cP = $.GetContextPanel();


                                                     

	_m_cP.Data().m_retries = 0;

	var _DisplayMe = function()
	{

		if ( GameStateAPI.IsDemoOrHltv() )
		{
			return false;
		}

		if ( isOfficialTournament )
		{
			return false;
		}

		if ( !_m_cP.bSkillgroupDataReady )
		{
			return false;
		}

		var localPlayerXuid = GameStateAPI.GetLocalPlayerXuid();

		var oSkillgroupData = _m_cP.SkillgroupDataJSO;

		var compWins = oSkillgroupData[ "num_wins" ];
		var oldRank = oSkillgroupData[ "old_rank" ];
		var newRank = oSkillgroupData[ "new_rank" ];


		var isOfficialTournament;                                                    

		_m_cP.SetDialogVariableInt( "competitive_wins", compWins );


		var _AnimSequenceNext = function( func, duration = 0 )
		{
			$.Schedule( animTime, func );
			animTime += duration;
		}

		var _AnimPause = function( sec )
		{
			animTime += sec;
		}

		                   
		_m_cP.SetDialogVariable( "skillgroup_name", $.Localize( "RankName_" + newRank ) );

		if ( newRank > oldRank )
		{
			_m_pauseBeforeEnd += 2;
			
			_m_cP.FindChildInLayoutFile( "id-eom-skillgroup" ).BLoadLayoutSnippet( "eom-skillgroup" );

			_m_cP.FindChildrenWithClassTraverse( "new-skillgroup" ).forEach( function( entry )
			{
				entry.RemoveClass( "hidden" );
			} )

			SetModel( newRank );

			                    
			                                                                                     
			                                                                                     
			                                           

			var animTime = 0;

			              
			                                  	

			   	                                                                                        

			     	   


			_AnimSequenceNext( function()
			{
				_m_cP.FindChildInLayoutFile( "id-eom-skillgroup" ).RemoveClass( "subdue" );
			} );



			_AnimPause( 2 );

		}
		else if ( newRank < 1 && compWins < 10 )                                    
		{
			_m_cP.FindChildInLayoutFile( "id-eom-skillgroup" ).BLoadLayoutSnippet( "eom-no-skillgroup" );

			_m_cP.SetDialogVariableInt( "missing_wins", 10 - compWins );
		}
		else if ( newRank < 1 && compWins >= 10 )                                         
		{
			
			
			_m_cP.FindChildInLayoutFile( "id-eom-skillgroup" ).BLoadLayoutSnippet( "eom-skillgroup-expired" );
		}
		else if ( newRank >= 1 )                   
		{
			
			_m_cP.FindChildInLayoutFile( "id-eom-skillgroup" ).BLoadLayoutSnippet( "eom-skillgroup" );

			                    
			                                                                                     
			                                                                                     

			
			                                           
			SetModel( newRank );
		}

		function SetModel( newRank )
		{
			var elModel = _m_cP.FindChildInLayoutFile( "id-eom-skillgroup-model" );

			var mode = GameStateAPI.GetGameModeInternalName( true );
									
			var imagePath = "skillgroup";

			                                          
			                                
			   	                      
			

			elModel.SetScene( "resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
			'models/inventory_items/skillgroups/' + imagePath + newRank + '.mdl',
				false
			);

			elModel.SetCameraPreset( 1, false );
			elModel.RemoveClass( 'hidden' );
			elModel.SetCameraPreset( 0, true );
		}

		return true;
	};





	                                                         
	                                                                      
	  
	  

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
		
		Start: _Start,
		Shutdown: _Shutdown,
	};


})();


                                                                                                    
                                           
                                                                                                    
(function () {

	EndOfMatch.RegisterPanelObject( EOM_Skillgroup );

})();
