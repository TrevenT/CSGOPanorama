          
   
   

"use strict"; 

var Chat = ( function (){
	
	function _Init() 
	{
		var elInput = $('#ChatInput');
		elInput.SetPanelEvent('oninputsubmit', Chat.ChatTextSubmitted );

		var elOpenChat = $.GetContextPanel().FindChildInLayoutFile('ChatPanelContainer');
		elOpenChat.SetPanelEvent( "onactivate", function() {
			$('#ChatContainer').AddClass( "chat-open" );
			$("#ChatInput").SetFocus();
			$( "#ChatInput" ).activationenabled = true;
			$( "#ChatInput" ).enabled = true;
			
			$.Schedule( .15, _ScrollToBottom );
		});

		var elCloseChat = $.GetContextPanel().FindChildInLayoutFile('ChatCloseButton');
		elCloseChat.SetPanelEvent( "onactivate", Chat.Close );
	}

	function _Close()
	{
		var elChatContainer = $( '#ChatContainer' ); 
		if ( elChatContainer.BHasClass( 'chat-open' ) )
		{
			elChatContainer.RemoveClass( "chat-open" );
			$.Schedule( .2, _ScrollToBottom );
			$( "#ChatInput" ).activationenabled = false;
			$( "#ChatInput" ).enabled = false;
			return true;
		}
		else
		{
			return false;
		}	

	}

	function _ChatTextSubmitted()
	{
		$.GetContextPanel().SubmitChatText();

		$('#ChatInput').text = "";
	}

	function _ShowPlayerCard( strSteamID ) 
	{
		var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParameters(
			'',
			'',
			'file://{resources}/layout/context_menus/context_menu_playercard.xml', 
			                            
			'xuid='+strSteamID
		);
	}

	function _OnNewChatEntry()
	{
		$.Schedule(.1, _ScrollToBottom );
	}

	function _ScrollToBottom()
	{
		$('#ChatLinesContainer').ScrollToBottom();
	}

	function _SessionUpdate( status )
	{
		var elChat = $.GetContextPanel().FindChildInLayoutFile('ChatPanelContainer');

		if( status ==='closed' )
			_ClearChatMessages();

		if ( !LobbyAPI.IsSessionActive() )
		{
			elChat.AddClass( 'hidden' );
		}
		else
		{
			var numPlayersActuallyInParty = PartyListAPI.GetCount();
			
			elChat.SetHasClass( 'hidden', ( numPlayersActuallyInParty < PartyListAPI.GetPartySessionUiThreshold() ) );
		}
	}

	function _ClearChatMessages()
	{
		var elMessagesContainer = $('#ChatLinesContainer');
		elMessagesContainer.RemoveAndDeleteChildren();
	}

	var _ClipPanelToNotOverlapSideBar = function ( noClip )
	{	
		var panelToClip = $.GetContextPanel();

		if( !panelToClip || panelToClip.BHasClass( 'hidden') )
			return;

		var panelToClipWidth = panelToClip.actuallayoutwidth;
		var friendsListWidthWhenExpanded = panelToClip.GetParent().FindChildInLayoutFile( 'mainmenu-sidebar__blur-target' ).contentwidth;
		
		var sideBarWidth = noClip ? 0 : friendsListWidthWhenExpanded;
		var clipPercent = (( panelToClipWidth - sideBarWidth ) / panelToClipWidth ) * 100;

		if( clipPercent )
			panelToClip.style.clip = 'rect( 0%, '+clipPercent+'%, 100%, 0% );';
	};

	return {
		Init 					: _Init,
		ChatTextSubmitted  		: _ChatTextSubmitted,
		ShowPlayerCard			: _ShowPlayerCard,
		SessionUpdate			: _SessionUpdate,
		NewChatEntry			: _OnNewChatEntry,
		OnSideBarHover			: _ClipPanelToNotOverlapSideBar,
		Close 					: _Close
	 };
})();

                                                                                                    
                                           
                                                                                                    
(function()
{
	Chat.Init();
	$.RegisterForUnhandledEvent( "PanoramaComponent_Lobby_MatchmakingSessionUpdate", Chat.SessionUpdate );
	$.RegisterForUnhandledEvent( "OnNewChatEntry", Chat.NewChatEntry );
	$.RegisterEventHandler( "Cancelled", $.GetContextPanel(), Chat.Close );
	$.RegisterForUnhandledEvent( 'SidebarIsCollapsed', Chat.OnSideBarHover );

})();
