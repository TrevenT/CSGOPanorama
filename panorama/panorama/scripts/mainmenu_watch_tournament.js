'use strict';

var mainmenu_watch_tournament = (function () {

    var _m_activeTab;
    var _m_initalizeHandler;

    var _NavigateToTab = function ( tab, tournament_id )
    {
                                                                         
        var pressedTab = $.FindChildInContext( '#' + tab );
        if ( _m_activeTab != pressedTab )
        {
            if ( _m_activeTab )
            {
                _m_activeTab.AddClass( 'TournamentMenu--Hide' );
            }

            _m_activeTab = pressedTab;
            _m_activeTab.visible = true;
            _m_activeTab.RemoveClass( 'TournamentMenu--Hide' );
        }

        if ( tab === "JsTournamentMatches" )
        {
            matchList.UpdateMatchList( pressedTab, tournament_id );
            if ( _m_activeTab.activeMatchInfoPanel )
            {
                matchInfo.ResizeRoundStatBars( _m_activeTab.activeMatchInfoPanel );
            }
        }
              
         
                                                                 
           
    }

                                                                          
     
                                                                           
         
                                       
                                                                                                
                                                          
                                                                    
                                                      
                                                           
                                                                                

                               
                                                                                  
                                                                                            
    
                                                
                                                                                      
                                              
                                               

                         
                                                              

                                                                                               


                                         
                                        
              

                                      
                                                                                                      
                                                                                                          
           
       

                           

    function _UpdateMatchList( listId )
    {
        if ( _m_activeTab && ( _m_activeTab.tournament_id === listId ) )
        {
            matchList.UpdateMatchList( _m_activeTab, listId );
        }
    }

    var _PopulateTournamentNavBarButtons = function ( tournament_id, elTournamentTab )
    {
        var tournamentNumber = _GetTournamentIdNumFromString(tournament_id);
        var navBarPanel = elTournamentTab.FindChildTraverse('content-navbar__tabs');

        if ( !elTournamentTab.hasSetUpNavBar ) {

            var _CreateNavBarButton = function ( buttonId, buttonTitle, targetTab, isSelected=false )
            {
                var elButton = $.CreatePanel( 'RadioButton', navBarPanel, buttonId, {
                    selected: isSelected,
                    group: 'TournamentNavBar' + tournamentNumber
                });
                elButton.BLoadLayoutSnippet( 'tournament-navbar-text' );
                var elButtonLabel = elButton.FindChildTraverse('navbar-header-text');
                elButtonLabel.text = buttonTitle;
                elButtonLabel.hittest = false;
                elButton.SetPanelEvent('onactivate', _NavigateToTab.bind( undefined, targetTab, tournament_id));
            }

            
            
                     
            _CreateNavBarButton( 'id-nav-matches', $.Localize( '#CSGO_Watch_Tournament_Matches_T2' ), 'JsTournamentMatches', true );

          
                                            
                                                                 
             
                                                                                                                                       
                                                                                                                               
             

                         
                                                                
             
                                                                                                                   
             

                          
                                                                
             
                                                                                                                            
			 
          
            
            elTournamentTab.hasSetUpNavBar = true;
        }
    }

    var _PopulateTournamentsPage = function ( tournament_id, elTournamentTab ) {
        
                                                                              
                

                                                                                                             

                                              
                                                                                                       
                                                                                      

                                                                                           
                                                                        
                                                          
                                                                
                                                                                             
         

                                                                                                               

                                          
                                                                                         
                                                                                  

                                                                                       
                                                                    
                                                                       
                                                                
                                                                                             
           

    }

                                                                    
    var _InitializeTournamentsPage = function ( tournament_id )
    {
        var elParentPanel = $( '#tournament_content_' + tournament_id );
        if ( elParentPanel )
        {
            elParentPanel.SetDialogVariable( 'tournament_name', $.Localize("#CSGO_Tournament_Event_Name_" + tournament_id.split(':')[1] ) );
                                                                                         
                                                                                       
            _PopulateTournamentNavBarButtons( tournament_id, elParentPanel );
            elParentPanel.FindChildInLayoutFile( "JsTournamentMatches" ).tournament_id = tournament_id;
            elParentPanel.isInitialized = true;
            if ( _m_initalizeHandler )
                $.UnregisterForUnhandledEvent( "InitializeTournamentsPage", _m_initalizeHandler );
            _NavigateToTab( "JsTournamentMatches", tournament_id );
        }

                                                                                                         
                                              
                                                                                                       
                                                                                 
                                                                                 

                                                                                           
         

                                                                                                         
                                          
                                                                                         
                                                                             
                                                                             

                                                                                       
           
    }
        

                                                                                               
                                            
                                                                                               

                     
                                                                                           
     
                              
                                                                                              
                                                                                                              
                                                     
                                              
                                                     
                                                   
                                                    
                                                  

                                 
                                                                                

                                               
         

                          
                                                                                    
                                                                                          
                                                                                    
                                                                                    

                                          
             
                                                                                                  
                                                                                                
                                                                                    
                                                                                           

                                                                                                         
                                                                                               
                                                    
                                                             
                                                         


                                                    
                                                                                
                
                                                                                 
                  
                               
                                                                                      
                                                        
                                                                    
                                                                       

                                                 
                 
                                                                       
                 

                                      
                                                                                 
                                                                        
                                                                                            
                 
                                                       
                 
                    
                 
                                                 
                 
                                                                                                       
                                                                                                                 

                                                            
                                                                                          
                                                     
                                                            


                            
                                                                                               

                                                     
                 
                                                                                                    
                                                                                        
                                                                                               

                                                                                              
                                                                                                                        

                                                            
                                                                                                     
                     
                                            
                     
                                                                                                                                     
                                       
                                                                                                            
                                                                                                             
                                                            
                                                                           

                                                            
                         
                                                                                                       
                         
                     

                 
                                                           
                 
                                    
                                         
                                                                                      
                 
                                                                                                                       
                                                          
                 
                                        
                 

                                                        
                                   
                 
                                                                                               
                                                                 
                                                                             
                                                                                
                    
                                                                                                   
                                                         
                                                                

                                                                                                        
                                                                                                         
                                                        
                                                                       

                                                                                            
                                                                                                                          
                                                                                                                             
                
                                                                                  
                                                                                  
                                                                                                                   
                 
             
         
     

                                                                                                                            
     
                                                                                          
                                                 
                                                                                         
                                                                                          
                                                                                               
                                                                                               

                       
                                   

                        
                                                                             
                           
         
                                                                                          
                           
                                                      
                                      
         
                                                      
                           
         
                                                        
                           
         
                         
                           

                                             
         
                                                                                           
                   
                                                                                         
                                                               
                                                                          
                                              
                                  

                                    

                                                                                         
                                                                                                   

                 
                                                                                         
                                                              
                                                                        
                                                              

                                              
             
                                                                                                               
                                                                                          
                                                                                                       
             
         

                                                   
                                                         
            
                                                    
                          
                                                                                                      
                                                                      
                                                                                       
                                            
                                                                          

                       
                                                                                      
                                                                    
                                                                                
                                                   
                                       

             
                
             
                                                                                
                                               
             
            
         
     

                                                                                   
     
                                                                            
                                                                                                   
                                                                                                                      
                                                          

                     
                                                                                               
                                                           

                      
                                                                      

                            
                                                                                          
         
                                                                                                                    

                       
                                                                                  
                                                                                  
         
     

                                                                                       
     
                                                                            
                                                
                                                                        
                                                    
                                                                     
                                                  
                                           
                      
       


                                                                                               
                                                                     
                                                                                               

                                                                             
     
                                      
                                                                                              

                                                                                                           
                                                        
                                                       
                                                               

                                                                                                                        
                                                               
                                                                
                                                              

                                                                                              
                                                 
                                                              
                                                  
                                                     

                                                                                  
                                                             

                                   
         
                         
            
                                                                                  
                                                    
                                                             

                               
                                                                                   
                                                                                          
                            
                              
            
                                                   
                                 
                                                                                                
                                                                                    
                                                                                           

                                  
                                                                                               
                                 
                                                                                                                 

                                                                                                         
                                                                  
                
                                 
                                
                    
                              
                                  

                            
                                                                                  
                                                                                             
                                                                                                
                                                                              
                                                                        
                                                                                                                
                 
                
                                    
                                                                                                                        
                
                            
                                                                              
                                      
                                                 
                                                       


                                                                     
                                                                    
                                                                                          

                                             
                                                                                             
                                                                                                         
                                                                                        

                                          
                 
                                                                                         
                 
                                                                                     
                                                  
                 
                                                                                            
                 
                                      

                                                                         
                 
                                                                                                                   
                                                                                          
                                                       
                 
                                                                                                          

                        
                           
                 
                                                                              
                                                    
                                                                                                   
                 
                
             
                                                                                     
         
     

                                                                                               
     
                                                                           
                                                
                                                         

                           
                            
                                                                                         
                                                                                       
        
                                               
                             
                                                                                            
                                                                                       
                                                                                

                        
                                                                           
                                                                                         
                                                                                         
                                                                          
                                                                    
                                                                                                            
             

                                                 
             
                                                                                                                              
                                                                  
                
                                    
                                                                                                      
                                                                     
                                                                    

                                      

                                  

                                                        
                 
                                                                                                                     
                                                                                  
                 
                    
                 
                                                                                            
                 

                                                                                                          
             
         
     


                                                        
     
                                                                             
                                                                                           
                                                                                     
                                                                                                     
                                                                                                  
                                                                  
                                                                        
                        
     

                                                                                    
     
                                                                                
                                                 
                                                                                 
                                                  
                                                                              
                                               

                         
                   
         
                                                   
                                                                                        
                                                                                  
                                            
                                                 
                                                                  
             
         
     

                                                                                  
                                                                                       
                   
         
                                                                                    
                                                  
         
                                                                    

                                                                                    
                                               
                                                                 

                                              
         
                                                                               
                                                               
                                                                         
                                  
         
     


                                                                                               
                                                 
                                                                                               

                                                                           
     
                                                                          
                                                                              
                                                                                   
                                                                                       
                                                                                     
                                                                                 


                                                                        
                                                                          

                                                                               
                                                            

                                                                                  
                                                             

                                                                    
                                                                     

                      
                           

                                                                                       

                                   
         
                                                                                
                                                       
                                                               
         

     

                                                                      
     
                                                                                          
                                                                                        
                                                                                      

                                                                                              
         
                                                               
                                                                 
                                                                                                    
                                                                              

                                      
             
                                                                    
                                                                                                              
             
         

            
         
                                                           
         
       

                                                                                               
                                                   
                                                                                               

                                                                           
     
                                                                                          
                                                                                                  

                                     
         
                                                                                                      
                                                                 
                                                                                                                       
         

                                                      
                                                                              

                                         
         
                                                                                         
                                                        
                         
                                                                                                   
                                
                                                       
               
                                                                    
                                                                                          

                                                                                                                                                                      

                                                     
                                                                                                                                            
                                                                       
                                                                                                                                            
                
                                                                                                                                      
         
     

                                                                            
     
                                                                            
                                                              

     

                                                                                               
                                                       
                                                                                               

                                                                                       
     
                  
                                    
         
                                                     
         
                                       
         
                                        
         
                                               
         
                                   
         

                                                               
                                                               
                                      
                                                                                                                    

                                                                                            
         
                                                                                      
         

                                                                                    
                                                         
                              

                                                                                                     
                                                                                                                    
        
       

    var _GetTournamentIdNumFromString = function ( tournament_id )
    {
        return tournament_id.split(':')[1];
    }


                                                           
    var _CloseSubMenu = function ( )
    {
        $.DispatchEvent( 'CloseSubMenuContent' );
    }

    function _Refresh( tabid )
    {
        if ( tabid === 'JsWatch' )
        {
            if ( _m_activeTab )
            {
                if ( _m_activeTab.activeMatchInfoPanel )
                {
                    matchInfo.ResizeRoundStatBars( _m_activeTab.activeMatchInfoPanel );
                    matchList.ReselectActiveTile( _m_activeTab );
                }
            }
        }
    }


    function _Init()
    {
        _m_activeTab = undefined;
                                                                                            
                                                                                                            
                                                                                            
        _m_initalizeHandler = $.RegisterForUnhandledEvent( "InitializeTournamentsPage", _InitializeTournamentsPage );
        $.RegisterForUnhandledEvent( "PanoramaComponent_MatchList_StateChange", _UpdateMatchList );
        $.RegisterForUnhandledEvent( "MainMenuTabShown", _Refresh );
    }

    return {
        CloseSubMenu            : _CloseSubMenu,
        NavigateToTab           : _NavigateToTab,
        Init                    : _Init,
                                                          
                                                             
                                                                            
                                                            
                                                         
                                                           
                                                             
                                                               
    }

})();

(function()
{
    mainmenu_watch_tournament.Init();
})();