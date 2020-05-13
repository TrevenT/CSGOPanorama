'use strict';

var playerCard = ( function (){

	var _m_xuid = '';
	var _m_currentLvl = null;
	var _m_isSelf = false;
	var _m_bShownInFriendsList = false;
	var _m_tooltipDelayHandle = false;

	var _Init = function()
	{
		_m_xuid = $.GetContextPanel().GetAttributeString( 'xuid', 'no XUID found' );
		_m_isSelf = _m_xuid === MyPersonaAPI.GetXuid() ? true : false;
		_m_bShownInFriendsList = $.GetContextPanel().GetAttributeString( 'data-slot', '' );

		                                                                                              

		                                                                          
		                                                                                                             

		if ( !_m_isSelf )
			FriendsListAPI.RequestFriendProfileUpdateFromScript( _m_xuid );

		_FillOutFriendCard();
	};
	
	var _FillOutFriendCard = function ()
	{
		if ( _m_xuid )
		{
			_m_currentLvl = FriendsListAPI.GetFriendLevel( _m_xuid );

			                                           
			_SetName();
			_SetAvatar();
			_SetFlairItems();
			_SetPlayerBackground();
			_SetRank();

			                                                                     
			if ( _m_isSelf )
			{
				if ( MyPersonaAPI.GetPipRankWins( "Competitive" ) >= 0 )
				{
					if ( _m_bShownInFriendsList )
						_SetSkillGroup( 'competitive' );
					else
						_SetAllSkillGroups();
				}
				else
				{
					var elToggleBtn = $.GetContextPanel().FindChildInLayoutFile( 'SkillGroupExpand' );
					elToggleBtn.visible = false;
				}
			}
			else
			{
				_SetAllSkillGroups();
			}

			                          
			if( _m_bShownInFriendsList )
			{
				$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCommendations' ).AddClass('hidden');
				$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerPrime' ).AddClass('hidden');
				_SetTeam();
			}
			else
			{
				_SetCommendations();
				_SetPrime();
			}
		}
	};

	var _ProfileUpdated = function( xuid )
	{
		                                                                                                           
		if ( _m_xuid === xuid )
			_FillOutFriendCard();
	};

	var _SetName = function()
	{
		var elNameLabel = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerName' );
		elNameLabel.text = FriendsListAPI.GetFriendName( _m_xuid );
	};

	var _SetAvatar = function()
	{
		var elAvatarExisting = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardAvatar' );

		if ( !elAvatarExisting )
		{
			var elParent = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardTop' );
			var elAvatar = $.CreatePanel( "Panel", elParent, 'JsPlayerCardAvatar' );
			elAvatar.SetAttributeString( 'xuid', _m_xuid );
			elAvatar.BLoadLayout( 'file://{resources}/layout/avatar.xml', false, false );
			elAvatar.BLoadLayoutSnippet( "AvatarPlayerCard" );
			                                                                   
			Avatar.Init( elAvatar, _m_xuid, 'playercard' );

			elParent.MoveChildBefore( elAvatar, $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardName' ) );
		}
		else
		{
			                                                                           
			Avatar.Init( elAvatarExisting, _m_xuid, 'playercard' );
		}
	};

	var _SetPlayerBackground = function()
	{
		var flairId = FriendsListAPI.GetFriendDisplayItemDefFeatured( _m_xuid );
		var imagePath = ItemDataAPI.GetItemInventoryImage( flairId );
		var elBgImage = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardBg' );
		
		elBgImage.style.backgroundImage =  ( imagePath ) ? 'url("file://{images_econ}' + imagePath + '_large.png")' : 'none';
		elBgImage.style.backgroundPosition = '50% 50%';
		elBgImage.style.backgroundSize = '115% auto';
		elBgImage.style.backgroundRepeat = 'no-repeat';
		elBgImage.style.backgroundImgOpacity = '0.2';

		elBgImage.AddClass( 'player-card-bg-anim' );
	};

	var _SetRank = function()
	{
		                                                             
		
		var currentPoints = FriendsListAPI.GetFriendXp( _m_xuid ),
			pointsPerLevel = MyPersonaAPI.GetXpPerLevel();

		var elRank = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerXp' ),
			elRankIcon = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerXpIcon' ),
			elRankText = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerRankName' );
		
		if ( !_m_currentLvl )
		{
			elRank.AddClass( 'hidden' );
			return;
		}

		                       
		var elXpBarInner = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerXpBarInner' );
		var percentComplete = ( currentPoints / pointsPerLevel ) * 100;
		elXpBarInner.style.width = percentComplete + '%';

		                    
		elRankText.SetDialogVariable( 'name', $.Localize( '#SFUI_XP_RankName_' + _m_currentLvl ) );
		elRankText.SetDialogVariableInt( 'level', _m_currentLvl );

		                              
		elRankIcon.SetImage( 'file://{images}/icons/xp/level' + _m_currentLvl + '.png' );
		
		elRank.RemoveClass( 'hidden' );

		var bPrestigeAvailable = _m_isSelf && ( _m_currentLvl >= InventoryAPI.GetMaxLevel() );
		$.GetContextPanel().FindChildInLayoutFile( 'GetPrestigeButton' ).SetHasClass( 'hidden', !bPrestigeAvailable );
		if ( bPrestigeAvailable )
		{
			$.GetContextPanel().FindChildInLayoutFile( 'GetPrestigeButtonClickable' ).SetPanelEvent(
				'onactivate',
				_OnActivateGetPrestigeButtonClickable
			);
		}
	};

	var _OnActivateGetPrestigeButtonClickable = function()
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_inventory_inspect.xml',
			'itemid=' + '0' +                                                                                          
			'&' + 'asyncworkitemwarning=no' +
			'&' + 'asyncworktype=prestigecheck'
		);
	};

	var _SetAllSkillGroups = function()
	{
		_SetSkillGroup( 'competitive' );
		_SetSkillGroup( 'wingman' );
	};

	var _SetSkillForLobbyTeammates= function()
	{
		var skillgroupType = "competitive";
		var skillGroup = 0;
		var wins = 0;
		                                                                             
		    
		   	                                                                      
		   	                                                                              
		   	                                                                        
		   	                                       
		   	 
		   		                                                                                     
		   	 
		   	    
		   	 
		   		                                                                                                 
		   	 
		    
	};

	var _SetSkillGroup = function( type )
	{
		var skillGroup = FriendsListAPI.GetFriendCompetitiveRank( _m_xuid, type );
		var wins = FriendsListAPI.GetFriendCompetitiveWins( _m_xuid, type );

		_UpdateSkillGroup( _LoadSkillGroupSnippet( type ), skillGroup, wins, type );
	};

	var _LoadSkillGroupSnippet = function( type )
	{
		var id = 'JsPlayerCardSkillGroup-' + type;
		var elParent = $.GetContextPanel().FindChildInLayoutFile( 'SkillGroupContainer' );
		var elSkillGroup = elParent.FindChildInLayoutFile( id );
		if ( !elSkillGroup )
		{
			elSkillGroup = $.CreatePanel( "Panel", elParent, id );
			elSkillGroup.BLoadLayoutSnippet( 'PlayerCardSkillGroup' );
			_ShowOtherRanksByDefault( elSkillGroup, type );
		}

		return elSkillGroup;
	};

	var _ShowOtherRanksByDefault = function( elSkillGroup, type )
	{
		                                                                    
		                                     
		                                                                                          
		                                 

		var elToggleBtn = $.GetContextPanel().FindChildInLayoutFile( 'SkillGroupExpand' );

		if ( type !== 'competitive' && _m_bShownInFriendsList )
		{
			elSkillGroup.AddClass( 'collapsed' );
			return;
		}

		elToggleBtn.visible = _m_bShownInFriendsList ? true : false;

		                                                                                           
		                    
		if ( !_m_bShownInFriendsList && _m_isSelf )
		{
			_AskForLocalPlayersWingmanSkillGroup();
		}
	};

	var _AskForLocalPlayersWingmanSkillGroup = function()
	{
		var skillGroup = FriendsListAPI.GetFriendCompetitiveRank( _m_xuid, 'wingman' );
		
		                                                                               
		if ( skillGroup === -1 )
		{
			MyPersonaAPI.HintLoadPipRanks( 'wingman' );
		}

		_SetSkillGroup( 'wingman' );
	};

	var _UpdateSkillGroup = function( elSkillGroup, skillGroup, wins, type )
	{
		var winsNeededForRank = 10;
		var tooltipText = '';
		var isloading = ( skillGroup === -1 ) ? true : false;
		var typeModifier = ( type === 'wingman' ) ? type : '';

		if ( wins < winsNeededForRank || isloading )
		{
			                                   
			if ( !_m_isSelf )
				return;

			if ( isloading )
			{
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillIcon' ).SetImage( 'file://{images}/icons/skillgroups/skillgroup_none.svg' );
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).text = $.Localize( '#SFUI_LOADING' );
			}
			else
			{
				var winsneeded = ( winsNeededForRank - wins );
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillIcon' ).SetImage( 'file://{images}/icons/skillgroups/skillgroup_none.svg' );
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).text = $.Localize( '#skillgroup_0' + typeModifier );
				elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).SetDialogVariableInt( "winsneeded", winsneeded );
				tooltipText = $.Localize( '#tooltip_skill_group_none'+ typeModifier, elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ) );
			}
		}
		else if ( wins >= winsNeededForRank && skillGroup < 1 )
		{
			                       

			if ( !_m_isSelf )
				return;
				
			elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillIcon' ).SetImage( 'file://{images}/icons/skillgroups/skillgroup_expired.svg' );
			elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).text = $.Localize( '#skillgroup_expired' + typeModifier );
			tooltipText = $.Localize( '#tooltip_skill_group_expired' + typeModifier );
		}
		else
		{
			                   
			var imageName = ( typeModifier !== '' ) ? typeModifier : 'skillgroup';
			elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillIcon' ).SetImage( 'file://{images}/icons/skillgroups/'+ imageName + skillGroup + '.svg' );
			elSkillGroup.FindChildInLayoutFile( 'JsPlayerSkillLabel' ).text = $.Localize( '#skillgroup_' + skillGroup );

			if ( _m_isSelf )
				tooltipText = $.Localize( '#tooltip_skill_group_generic' + typeModifier );
		}
		
		var tooltipLoc = elSkillGroup.id;
		tooltipText = ( tooltipText !== '' ) ? tooltipText + '<br><br>' + GetMatchWinsText( elSkillGroup, wins ) : GetMatchWinsText( elSkillGroup, wins );
		
		elSkillGroup.RemoveClass( 'hidden' );
		if ( !isloading )
		{
			elSkillGroup.SetPanelEvent( 'onmouseover', _ShowSkillGroupTooltip.bind( undefined, tooltipLoc, tooltipText ) );
			elSkillGroup.SetPanelEvent( 'onmouseout', _HideSkillGroupTooltip );
		}
	};

	var GetMatchWinsText = function( elSkillGroup, wins )
	{
		elSkillGroup.SetDialogVariableInt( 'wins', wins );
		return $.Localize( '#tooltip_skill_group_wins', elSkillGroup );
	};

	var _SetCommendations = function()
	{
		var catagories = [
			{ key: 'friendly', value: 0 },
			{ key: 'teaching', value: 0 },
			{ key: 'leader', value: 0 }
		];

		var catagoriesCount = catagories.length;
		var hasAnyCommendations = false;
		var countHiddenCommends = 0;
		var elCommendsBlock = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCommendations' );
		
		for ( var i = 0; i < catagoriesCount; i++ )
		{
			catagories[ i ].value = FriendsListAPI.GetFriendCommendations( _m_xuid, catagories[ i ].key );
			                                                                                   

			var elCommend = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayer' + catagories[ i ].key );
			
			                                            
			if ( !catagories[ i ].value || catagories[ i ].value === 0 )
			{
				elCommend.AddClass( 'hidden' );
				countHiddenCommends++;
			}
			else
			{
				if ( elCommendsBlock.BHasClass( 'hidden' ) )
					elCommendsBlock.RemoveClass( 'hidden' );
				
				elCommend.RemoveClass( 'hidden' );
				elCommend.FindChild( 'JsCommendLabel' ).text = catagories[ i ].value;
			}
		}

		                                                        
		                                                                                
		                                         

		                             
		    
		   	                                                                                 
		   	                      
		    
		       
		    
		   	                                                                                    
		   	                                                                                                      
		    

		                                                                   
		if ( countHiddenCommends === catagoriesCount  )
			elCommendsBlock.AddClass( 'hidden' );
	};

	var _SetPrime = function()
	{
		var elPrime = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerPrime' );

		                                                    
		                                                                                 

		if ( !MyPersonaAPI.IsInventoryValid() )
			elPrime.AddClass( 'hidden' );

		                                      
		if ( PartyListAPI.GetFriendPrimeEligible( _m_xuid ) )
		{
			elPrime.RemoveClass( 'hidden' );
			return;
		}
		else
			elPrime.AddClass( 'hidden' );

		var currentStatus = MyPersonaAPI.GetElevatedState();

		if ( currentStatus === 'loading' )
			elPrime.AddClass( 'hidden' );

		var bHasPrestige = MyPersonaAPI.HasPrestige();

		                                                                                                       
		if ( bHasPrestige || FriendsListAPI.GetFriendLevel( _m_xuid ) > 20 )
		{
			                                                      
		}
	};

	var _SetTeam = function()
	{
		if ( !_m_isSelf )
			return;

		if ( !MyPersonaAPI.IsInventoryValid() )
			return;

		var teamName = MyPersonaAPI.GetMyOfficialTeamName(),
			tournamentName = MyPersonaAPI.GetMyOfficialTournamentName();
		
		var showTeam = !teamName ? false : true;
		
		                            
		if ( !teamName || !tournamentName )
		{
			$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerTeam' ).AddClass( 'hidden' );
			return;
		}
		
		$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerTeam' ).RemoveClass( 'hidden' );
		$.GetContextPanel().FindChildInLayoutFile( 'JsPlayerSkill' ).ToggleClass( 'hidden' );
		
		var teamTag = MyPersonaAPI.GetMyOfficialTeamTag();

		$.GetContextPanel().FindChildInLayoutFile( 'JsTeamIcon' ).SetImage( 'file://{images}/icons/teams/' + teamTag + '.png' );
		$.GetContextPanel().FindChildInLayoutFile( 'JsTeamLabel' ).text = teamName;
		$.GetContextPanel().FindChildInLayoutFile( 'JsTournamentLabel' ).text = tournamentName;
	};

	var _SetFlairItems = function()
	{
		                                                        
		var flairItems = FriendsListAPI.GetFriendDisplayItemDefCount( _m_xuid );
		var flairDefIndexList = [];
		var elFlairPanal = $.GetContextPanel().FindChildInLayoutFile( 'FlairCarouselAndControls' );

		if ( !flairItems )
		{
			elFlairPanal.AddClass( 'hidden' );
			return;
		}

		for ( var i = 0; i < flairItems; i++ )
		{
			flairDefIndexList.push( FriendsListAPI.GetFriendDisplayItemDefByIndex( _m_xuid, i ) );
		}

		                                                                       
		$.GetContextPanel().FindChildInLayoutFile( 'FlairCarousel' ).RemoveAndDeleteChildren();
		_MakeFlairCarouselPages( elFlairPanal, flairDefIndexList );

		elFlairPanal.RemoveClass( 'hidden' );
	};

	var _MakeFlairCarouselPages = function( elFlairPanal, flairDefIndexList )
	{
		var flairsPerPage = 5;
		var countFlairItems = flairDefIndexList.length;
		var elFlairCarousel = $.GetContextPanel().FindChildInLayoutFile( 'FlairCarousel' );
		var elCarouselPage = null;

		for ( var i = 0; i < countFlairItems; i++ )
		{
			if ( i % 5 === 0 )
			{
				elCarouselPage = $.CreatePanel( 'Panel', elFlairCarousel, '', { class: 'playercard-flair-carousel__page' } );
			}

			var imagePath = ItemDataAPI.GetItemInventoryImage( flairDefIndexList[ i ] );
			var idForFlair = _m_xuid + flairDefIndexList[ i ];
			var elFlair = $.CreatePanel( 'Image', elCarouselPage, idForFlair, {
				class: 'playercard-flair__icon',
				src: 'file://{images_econ}' + imagePath + '_small.png',
				scaling: 'stretch-to-fit-preserve-aspect'
			} );

			var onMouseOver = function( flairDefIndex, idForTooltipLocaation )
			{
				var tooltipText = ItemDataAPI.GetItemName( flairDefIndex );
				UiToolkitAPI.ShowTextTooltip( idForTooltipLocaation, tooltipText );
			};

			elFlair.SetPanelEvent( 'onmouseover', onMouseOver.bind( undefined, flairDefIndexList[ i ], idForFlair ) );
			elFlair.SetPanelEvent( 'onmouseout', function()
			{
				UiToolkitAPI.HideTextTooltip();
			} );
		}
	};

	var _SetMedals = function()
	{
		var medalTypesCount = MedalsAPI.GetAchievementMedalTypesCount();

		for ( var i = 0; i < medalTypesCount; i++ )
		{
			var medalType = MedalsAPI.GetMedalTypeByIndex( i );
			var rank = FriendsListAPI.GetFriendMedalRankByType( _m_xuid, medalType );
			                                           
			if ( !rank )
				return;
		}
	};

	  
	                                                                                                          
	 

		                                                               
		                                                      
		
		                                                                                                   
		
		                                                                                   
		
		                                
		                                 
		                                                                     
		                  
		
		                                                                                                                  
		                                                                                                                                               
		                                                                      
		 
			                                                                                                              
			                              
			 
				                                                                   
				                       
				                                    
			 
		 
		                                                                                

		                                                                                          
		                                                                                           
	 
	  

	var _ShowXpTooltip = function()
	{
		var ShowTooltip = function()
		{
			_m_tooltipDelayHandle = false;

			if ( !_m_isSelf )
				return;

			if ( _m_currentLvl && _m_currentLvl > 0 )
				UiToolkitAPI.ShowCustomLayoutParametersTooltip( 'JsPlayerXpIcon',
					'XpToolTip',
					'file://{resources}/layout/tooltips/tooltip_player_xp.xml',
					'xuid=' + _m_xuid
				);
		};

		_m_tooltipDelayHandle = $.Schedule( 0.3, ShowTooltip );
	};

	var _HideXpTooltip = function()
	{
		if ( _m_tooltipDelayHandle != false )
		{
			$.CancelScheduled( _m_tooltipDelayHandle );
			_m_tooltipDelayHandle = false;
		}

		UiToolkitAPI.HideCustomLayoutTooltip( 'XpToolTip' );
	};

	var _ShowSkillGroupTooltip = function( id, tooltipText )
	{
		var ShowTooltipSkill = function()
		{
			_m_tooltipDelayHandle = false;
			
			UiToolkitAPI.ShowTextTooltip( id,  tooltipText );
		};

		_m_tooltipDelayHandle = $.Schedule( 0.3, ShowTooltipSkill );
	};

	var _HideSkillGroupTooltip = function()
	{
		if ( _m_tooltipDelayHandle != false )
		{
			$.CancelScheduled( _m_tooltipDelayHandle );
			_m_tooltipDelayHandle = false;
		}
	
		UiToolkitAPI.HideTextTooltip();
	};


	var _UpdateAvatar = function()
	{
		_SetAvatar();
		_SetPlayerBackground();
		_SetFlairItems();
	};

	var _ShowHideAdditionalRanks = function()
	{
		var elToggleBtn = $.GetContextPanel().FindChildInLayoutFile( 'SkillGroupExpand' );

		if ( elToggleBtn.checked )
		{
			_AskForLocalPlayersWingmanSkillGroup();
		}

		var elWingman = $.GetContextPanel().FindChildInLayoutFile( 'JsPlayerCardSkillGroup-wingman' );
		elWingman.SetHasClass( 'collapsed', !elToggleBtn.checked );
	};

	var _UpdateAvatarForLocalPlayerCard = function ( xuid )
	{
		                                                              
		                                                                       

		if(  $.GetContextPanel().visible && _m_isSelf )
		{
			_UpdateAvatar();
		}
	}

	return {
		Init					: _Init,
		ProfileUpdated			: _ProfileUpdated,                 
		FillOutFriendCard		: _FillOutFriendCard, 
		UpdateName				: _SetName,
		UpdateAvatar			: _UpdateAvatar,
		ShowSkillGroupTooltip	: _ShowSkillGroupTooltip,
		HideSkillGroupTooltip	: _HideSkillGroupTooltip,
		ShowXpTooltip			: _ShowXpTooltip,
		HideXpTooltip: _HideXpTooltip,
		SetAllSkillGroups: _SetAllSkillGroups,
		ShowHideAdditionalRanks: _ShowHideAdditionalRanks
		
	};

})();

                                                                                                    
                                            
                                                                                                    
(function()
{
	
    if ( $.DbgIsReloadingScript() )
    {
                                         
    }

	playerCard.Init();
	$.RegisterForUnhandledEvent( 'PanoramaComponent_GC_Hello', playerCard.FillOutFriendCard );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_NameChanged', playerCard.UpdateName );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', playerCard.UpdateAvatar );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_MedalsChanged', playerCard.UpdateAvatar );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_FriendsList_ProfileUpdated', playerCard.ProfileUpdated );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_PipRankUpdate', playerCard.SetAllSkillGroups );
	$.RegisterForUnhandledEvent( "PanoramaComponent_Lobby_PlayerUpdated", playerCard.UpdateAvatar );
	                                                                                          
})();